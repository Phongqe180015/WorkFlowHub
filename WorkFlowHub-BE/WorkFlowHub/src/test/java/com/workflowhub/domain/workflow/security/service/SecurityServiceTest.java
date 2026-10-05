package com.workflowhub.domain.workflow.security.service;

import com.workflowhub.common.exception.BadRequestException;
import com.workflowhub.common.exception.UnauthorizedException;
import com.workflowhub.domain.master.dto.response.UserResponse;
import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.domain.master.irepository.IUsersRepository;
import com.workflowhub.domain.master.mapper.IUsersMapper;
import com.workflowhub.domain.workflow.security.dto.request.ChangePasswordRequest;
import com.workflowhub.domain.workflow.security.dto.request.LoginRequest;
import com.workflowhub.domain.workflow.security.dto.request.RefreshTokenRequest;
import com.workflowhub.domain.workflow.security.dto.response.AuthResponse;
import com.workflowhub.domain.workflow.security.jwt.JwtTokenProvider;
import com.workflowhub.domain.workflow.security.jwt.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityServiceTest {

    @Mock
    private IUsersRepository usersRepository;

    @Mock
    private IUsersMapper usersMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private SecurityService securityService;

    @BeforeEach
    void setUp() {
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void login_Successful() {
        LoginRequest request = new LoginRequest("user@example.com", "Password123");
        UsersEntity user = new UsersEntity();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setPassword("encodedPassword");
        user.setStatus("active");

        UserResponse userResponse = UserResponse.builder()
                .id(1L)
                .email("user@example.com")
                .build();

        when(usersRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123", "encodedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(user)).thenReturn("access-token-123");
        when(jwtTokenProvider.generateRefreshToken(user)).thenReturn("refresh-token-123");
        when(jwtTokenProvider.getAccessTokenExpirationMs()).thenReturn(3600000L);
        when(usersMapper.toResponse(user)).thenReturn(userResponse);

        AuthResponse response = securityService.login(request);

        assertNotNull(response);
        assertEquals("access-token-123", response.getAccessToken());
        assertEquals("refresh-token-123", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
    }

    @Test
    void login_InvalidPassword_ThrowsUnauthorizedException() {
        LoginRequest request = new LoginRequest("user@example.com", "WrongPassword");
        UsersEntity user = new UsersEntity();
        user.setEmail("user@example.com");
        user.setPassword("encodedPassword");

        when(usersRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "encodedPassword")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> securityService.login(request));
    }

    @Test
    void changePassword_Successful() {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken("user@example.com", null, java.util.Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UsersEntity user = new UsersEntity();
        user.setEmail("user@example.com");
        user.setPassword("oldEncodedPassword");

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPassword123")
                .newPassword("NewPassword123")
                .confirmPassword("NewPassword123")
                .build();

        when(usersRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("OldPassword123", "oldEncodedPassword")).thenReturn(true);
        when(passwordEncoder.matches("NewPassword123", "oldEncodedPassword")).thenReturn(false);
        when(passwordEncoder.encode("NewPassword123")).thenReturn("newEncodedPassword");

        securityService.changePassword(request);

        assertEquals("newEncodedPassword", user.getPassword());
        verify(usersRepository).save(user);
    }

    @Test
    void changePassword_MismatchConfirm_ThrowsBadRequestException() {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken("user@example.com", null, java.util.Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UsersEntity user = new UsersEntity();
        user.setEmail("user@example.com");
        user.setPassword("oldEncodedPassword");

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPassword123")
                .newPassword("NewPassword123")
                .confirmPassword("DifferentPassword")
                .build();

        when(usersRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("OldPassword123", "oldEncodedPassword")).thenReturn(true);
        when(passwordEncoder.matches("NewPassword123", "oldEncodedPassword")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> securityService.changePassword(request));
    }

    @Test
    void logout_BlacklistsTokenAndClearsContext() {
        when(jwtTokenProvider.resolveToken(httpServletRequest)).thenReturn("sample-token");
        when(jwtTokenProvider.validateToken("sample-token")).thenReturn(true);
        when(jwtTokenProvider.getExpirationDate("sample-token")).thenReturn(Instant.now().plusSeconds(3600));

        securityService.logout(httpServletRequest);

        verify(tokenBlacklistService).blacklistToken(eq("sample-token"), any(Instant.class));
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}

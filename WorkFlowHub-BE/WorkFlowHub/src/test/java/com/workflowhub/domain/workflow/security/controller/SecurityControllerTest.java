package com.workflowhub.domain.workflow.security.controller;

import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.domain.master.dto.request.CreateUserRequest;
import com.workflowhub.domain.master.dto.response.UserResponse;
import com.workflowhub.domain.master.iservice.IUsersService;
import com.workflowhub.domain.workflow.security.dto.request.ChangePasswordRequest;
import com.workflowhub.domain.workflow.security.dto.request.LoginRequest;
import com.workflowhub.domain.workflow.security.dto.request.RefreshTokenRequest;
import com.workflowhub.domain.workflow.security.dto.request.RegisterRequest;
import com.workflowhub.domain.workflow.security.dto.response.AuthResponse;
import com.workflowhub.domain.workflow.security.iservice.ISecurityService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityControllerTest {

    @Mock
    private ISecurityService securityService;

    @Mock
    private IUsersService usersService;

    @Mock
    private HttpServletRequest httpServletRequest;

    private SecurityController securityController;

    @BeforeEach
    void setUp() {
        securityController = new SecurityController(securityService, usersService);
    }

    @Test
    void shouldLoginSuccessfully() {
        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("Password123")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("mock-access-token")
                .refreshToken("mock-refresh-token")
                .tokenType("Bearer")
                .expiresIn(3600000L)
                .build();

        when(securityService.login(request)).thenReturn(authResponse);

        ApiResponse<AuthResponse> response = securityController.login(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("mock-access-token", response.getData().getAccessToken());
        verify(securityService).login(request);
    }

    @Test
    void shouldRegisterUsingUsersService() {
        RegisterRequest request = RegisterRequest.builder()
                .email("new@example.com")
                .password("Password123")
                .name("New User")
                .avatar("avatar.png")
                .build();

        UserResponse userResponse = UserResponse.builder()
                .id(10L)
                .email("new@example.com")
                .name("New User")
                .build();

        when(usersService.createUser(any(CreateUserRequest.class))).thenReturn(userResponse);

        ApiResponse<UserResponse> response = securityController.register(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("new@example.com", response.getData().getEmail());
        verify(usersService).createUser(any(CreateUserRequest.class));
    }

    @Test
    void shouldChangePasswordSuccessfully() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPassword123")
                .newPassword("NewPassword123")
                .confirmPassword("NewPassword123")
                .build();

        doNothing().when(securityService).changePassword(request);

        ApiResponse<Void> response = securityController.changePassword(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        verify(securityService).changePassword(request);
    }

    @Test
    void shouldLogoutSuccessfully() {
        doNothing().when(securityService).logout(httpServletRequest);

        ApiResponse<Void> response = securityController.logout(httpServletRequest);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        verify(securityService).logout(httpServletRequest);
    }

    @Test
    void shouldRefreshTokenSuccessfully() {
        RefreshTokenRequest request = RefreshTokenRequest.builder()
                .refreshToken("valid-refresh-token")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("new-access-token")
                .refreshToken("valid-refresh-token")
                .build();

        when(securityService.refreshToken(request)).thenReturn(authResponse);

        ApiResponse<AuthResponse> response = securityController.refreshToken(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("new-access-token", response.getData().getAccessToken());
        verify(securityService).refreshToken(request);
    }
}

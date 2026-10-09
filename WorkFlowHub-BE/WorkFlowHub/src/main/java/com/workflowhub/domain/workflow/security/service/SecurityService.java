package com.workflowhub.domain.workflow.security.service;

import com.workflowhub.common.constant.SecurityConstants;
import com.workflowhub.common.exception.BadRequestException;
import com.workflowhub.common.exception.ForbiddenException;
import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.exception.UnauthorizedException;
import com.workflowhub.domain.master.dto.response.UserResponse;
import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.domain.master.irepository.IUsersRepository;
import com.workflowhub.domain.master.mapper.IUsersMapper;
import com.workflowhub.domain.workflow.security.dto.request.ChangePasswordRequest;
import com.workflowhub.domain.workflow.security.dto.request.GoogleLoginRequest;
import com.workflowhub.domain.workflow.security.dto.request.LoginRequest;
import com.workflowhub.domain.workflow.security.dto.request.RefreshTokenRequest;
import com.workflowhub.domain.workflow.security.dto.response.AuthResponse;
import com.workflowhub.domain.workflow.security.iservice.ISecurityService;
import com.workflowhub.domain.workflow.security.jwt.JwtTokenProvider;
import com.workflowhub.domain.workflow.security.jwt.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.workflowhub.common.constant.MessageConstants.AUTHENTICATION_REQUIRED_TO_CHANGE_PASSWORD;
import static com.workflowhub.common.constant.MessageConstants.CURRENT_PASSWORD_IS_INCORRECT;
import static com.workflowhub.common.constant.MessageConstants.INVALID_EMAIL_OR_PASSWORD;
import static com.workflowhub.common.constant.MessageConstants.INVALID_OR_EXPIRED_REFRESH_TOKEN;
import static com.workflowhub.common.constant.MessageConstants.NEW_PASSWORD_CANNOT_BE_THE_SAME_AS_CURRENT_PASSWORD;
import static com.workflowhub.common.constant.MessageConstants.PASSWORD_CONFIRMATION_DOES_NOT_MATCH;
import static com.workflowhub.common.constant.MessageConstants.USER;
import static com.workflowhub.common.constant.MessageConstants.USER_NOT_FOUND_FOR_REFRESH_TOKEN;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.workflowhub.domain.workflow.security.entity.RoleEntity;
import com.workflowhub.domain.workflow.security.irepository.IRoleRepository;
import org.springframework.beans.factory.annotation.Value;

import java.util.Collections;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityService implements ISecurityService {

    @Value("${google.client-id:}")
    private String googleClientId;

    private final IUsersRepository usersRepository;
    private final IRoleRepository roleRepository;
    private final IUsersMapper usersMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        UsersEntity user = usersRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException(INVALID_EMAIL_OR_PASSWORD));

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!matches && request.getPassword().equals(user.getPassword())) {
            // Auto-upgrade plain-text password from previous dev baseline to BCrypt
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            usersRepository.save(user);
            matches = true;
        }

        if (!matches) {
            throw new UnauthorizedException(INVALID_EMAIL_OR_PASSWORD);
        }

        if ("inactive".equalsIgnoreCase(user.getStatus()) || "suspended".equalsIgnoreCase(user.getStatus())) {
            throw new ForbiddenException("Account is " + user.getStatus());
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        UserResponse userResponse = usersMapper.toResponse(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType(SecurityConstants.BEARER_PREFIX.trim())
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs())
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse loginGoogle(GoogleLoginRequest request) {
        GoogleIdToken.Payload payload = verifyGoogleIdToken(request.getIdToken());
        String email = payload.getEmail();
        Boolean emailVerified = payload.getEmailVerified();

        if (Boolean.FALSE.equals(emailVerified)) {
            throw new UnauthorizedException("Google email is not verified");
        }

        String name = (String) payload.get("name");
        String pictureUrl = (String) payload.get("picture");

        UsersEntity user = usersRepository.findByEmail(email).orElseGet(() -> {
            RoleEntity defaultRole = roleRepository.getByName(USER)
                    .orElseGet(() -> roleRepository.findById(2L).orElse(null));

            UsersEntity newUser = new UsersEntity();
            newUser.setEmail(email);
            newUser.setName(name != null && !name.isBlank() ? name : email.split("@")[0]);
            newUser.setAvatar(pictureUrl);
            newUser.setStatus("active");
            newUser.setRole(defaultRole);
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            return usersRepository.save(newUser);
        });

        if ("inactive".equalsIgnoreCase(user.getStatus()) || "suspended".equalsIgnoreCase(user.getStatus())) {
            throw new ForbiddenException("Account is " + user.getStatus());
        }

        boolean updated = false;
        if (ObjectUtils.isEmpty(user.getAvatar()) && ObjectUtils.isNotEmpty(pictureUrl)) {
            user.setAvatar(pictureUrl);
            updated = true;
        }
        if (ObjectUtils.isEmpty(user.getName()) && ObjectUtils.isNotEmpty(name)) {
            user.setName(name);
            updated = true;
        }
        if (updated) {
            user = usersRepository.save(user);
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        UserResponse userResponse = usersMapper.toResponse(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType(SecurityConstants.BEARER_PREFIX.trim())
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs())
                .user(userResponse)
                .build();
    }

    private GoogleIdToken.Payload verifyGoogleIdToken(String idTokenString) {
        try {
            NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
            JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

            GoogleIdTokenVerifier.Builder verifierBuilder = new GoogleIdTokenVerifier.Builder(transport, jsonFactory);
            if (ObjectUtils.isNotEmpty(googleClientId)) {
                verifierBuilder.setAudience(Collections.singletonList(googleClientId));
            }

            GoogleIdTokenVerifier verifier = verifierBuilder.build();
            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken != null) {
                return idToken.getPayload();
            } else {
                throw new UnauthorizedException("Invalid Google ID token");
            }
        } catch (Exception e) {
            log.error("Failed to verify Google ID token", e);
            throw new UnauthorizedException("Google authentication failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (ObjectUtils.isEmpty(authentication) || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException(AUTHENTICATION_REQUIRED_TO_CHANGE_PASSWORD);
        }

        String email = authentication.getName();
        UsersEntity user = usersRepository.findByEmail(email)
                .orElseThrow(() -> NotFoundException.of(USER, email));

        boolean matches = passwordEncoder.matches(request.getCurrentPassword(), user.getPassword());
        if (!matches && request.getCurrentPassword().equals(user.getPassword())) {
            matches = true;
        }

        if (!matches) {
            throw new BadRequestException(CURRENT_PASSWORD_IS_INCORRECT);
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword()) ||
                request.getNewPassword().equals(user.getPassword())) {
            throw new BadRequestException(NEW_PASSWORD_CANNOT_BE_THE_SAME_AS_CURRENT_PASSWORD);
        }

        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()
                && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException(PASSWORD_CONFIRMATION_DOES_NOT_MATCH);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usersRepository.save(user);
        log.info("Password changed successfully for user: {}", email);
    }

    @Override
    public void logout(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        if (ObjectUtils.isNotEmpty(token) && jwtTokenProvider.validateToken(token)) {
            tokenBlacklistService.blacklistToken(token, jwtTokenProvider.getExpirationDate(token));
        }
        SecurityContextHolder.clearContext();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtTokenProvider.validateToken(refreshToken) || tokenBlacklistService.isBlacklisted(refreshToken)) {
            throw new UnauthorizedException(INVALID_OR_EXPIRED_REFRESH_TOKEN);
        }

        String email = jwtTokenProvider.extractEmail(refreshToken);
        UsersEntity user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException(USER_NOT_FOUND_FOR_REFRESH_TOKEN));

        if ("inactive".equalsIgnoreCase(user.getStatus()) || "suspended".equalsIgnoreCase(user.getStatus())) {
            throw new ForbiddenException("Account is " + user.getStatus());
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        UserResponse userResponse = usersMapper.toResponse(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType(SecurityConstants.BEARER_PREFIX.trim())
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs())
                .user(userResponse)
                .build();
    }
}

package com.workflowhub.domain.workflow.security.controller;

import com.workflowhub.common.constant.ApiConstants;
import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.controller.BaseController;
import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.domain.master.dto.request.CreateUserRequest;
import com.workflowhub.domain.master.dto.response.UserResponse;
import com.workflowhub.domain.master.iservice.IUsersService;
import com.workflowhub.domain.workflow.security.dto.request.ChangePasswordRequest;
import com.workflowhub.domain.workflow.security.dto.request.GoogleLoginRequest;
import com.workflowhub.domain.workflow.security.dto.request.LoginRequest;
import com.workflowhub.domain.workflow.security.dto.request.RefreshTokenRequest;
import com.workflowhub.domain.workflow.security.dto.request.RegisterRequest;
import com.workflowhub.domain.workflow.security.dto.response.AuthResponse;
import com.workflowhub.domain.workflow.security.iservice.ISecurityService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.flywaydb.core.internal.util.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;

import static com.workflowhub.common.constant.MessageConstants.BACKEND_RUN_SUCCESSFUL;
import static com.workflowhub.common.constant.MessageConstants.LOGIN_SUCCESSFUL;
import static com.workflowhub.common.constant.MessageConstants.LOGOUT_SUCCESSFUL;
import static com.workflowhub.common.constant.MessageConstants.OK;
import static com.workflowhub.common.constant.MessageConstants.PASSWORD_CHANGED_SUCCESSFULLY;
import static com.workflowhub.common.constant.MessageConstants.TOKEN_REFRESHED_SUCCESSFULLY;

@RestController
@RequestMapping(AppConstants.API_PREFIX + ApiConstants.AUTH)
@RequiredArgsConstructor
public class SecurityController extends BaseController {

    private final ISecurityService securityService;
    private final IUsersService usersService;

    // Health check endpoint for wake-up check and container liveness
    @GetMapping("/health")
    public ApiResponse<String> checkHealth() {
        return success(OK, BACKEND_RUN_SUCCESSFUL);
    }

    // login
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return success(securityService.login(request), LOGIN_SUCCESSFUL);
    }

    // Login with Google (ID Token payload)
    @PostMapping("/login-google")
    public ApiResponse<AuthResponse> loginGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return success(securityService.loginGoogle(request));
    }

    // Google OAuth Server-Redirect Login
    @GetMapping("/google/login")
    public RedirectView initiateGoogleLogin(
            @RequestParam(value = "client_url", required = false) String clientUrl,
            HttpServletRequest request) {
        String baseUrl = getBaseUrl(request);
        String redirectUri = baseUrl + AppConstants.API_PREFIX + ApiConstants.AUTH + "/google/callback";

        if (!StringUtils.hasText(clientUrl)) {
            String referer = request.getHeader("Referer");
            if (org.springframework.util.StringUtils.hasText(referer)) {
                try {
                    java.net.URI uri = new java.net.URI(referer);
                    clientUrl = uri.getScheme() + "://" + uri.getAuthority();
                } catch (Exception ignored) {}
            }
        }

        String googleAuthUrl = securityService.getGoogleAuthUrl(redirectUri, clientUrl);
        return new RedirectView(googleAuthUrl);
    }

    // Google OAuth Server-Redirect Callback
    @GetMapping("/google/callback")
    public void handleGoogleCallback(
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String state,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        String baseUrl = getBaseUrl(request);
        String redirectUri = baseUrl + AppConstants.API_PREFIX + ApiConstants.AUTH + "/google/callback";
        securityService.handleGoogleCallback(code, redirectUri, state, response);
    }

    private String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        StringBuilder url = new StringBuilder();
        url.append(scheme).append("://").append(serverName);
        if (("http".equals(scheme) && serverPort != 80) || ("https".equals(scheme) && serverPort != 443)) {
            url.append(":").append(serverPort);
        }
        return url.toString();
    }

    // logout
    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest request) {
        securityService.logout(request);
        return success(null, LOGOUT_SUCCESSFUL);
    }

    // change password
    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        securityService.changePassword(request);
        return success(null, PASSWORD_CHANGED_SUCCESSFULLY);
    }

    // register should call api create user. I think should use usersService to register.
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        CreateUserRequest createUserRequest = CreateUserRequest.builder()
                .email(request.getEmail())
                .password(request.getPassword())
                .name(request.getName())
                .avatar(request.getAvatar())
                .status("active")
                .build();
        return created(usersService.createUser(createUserRequest));
    }

    // refresh token
    @PostMapping("/refresh-token")
    public ApiResponse<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return success(securityService.refreshToken(request), TOKEN_REFRESHED_SUCCESSFULLY);
    }
}

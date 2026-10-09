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
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(AppConstants.API_PREFIX + ApiConstants.AUTH)
@RequiredArgsConstructor
public class SecurityController extends BaseController {

    public static final String LOGIN_SUCCESSFUL = "Login successful";
    public static final String LOGOUT_SUCCESSFUL = "Logout successful";
    public static final String PASSWORD_CHANGED_SUCCESSFULLY = "Password changed successfully";
    public static final String TOKEN_REFRESHED_SUCCESSFULLY = "Token refreshed successfully";
    private final ISecurityService securityService;
    private final IUsersService usersService;

    // login
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return success(securityService.login(request), LOGIN_SUCCESSFUL);
    }

    //Login with Google
    @PostMapping("/login-google")
    public ApiResponse<AuthResponse> loginGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return success(securityService.loginGoogle(request));
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

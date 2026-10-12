package com.workflowhub.domain.workflow.security.iservice;

import com.workflowhub.domain.workflow.security.dto.request.ChangePasswordRequest;
import com.workflowhub.domain.workflow.security.dto.request.GoogleLoginRequest;
import com.workflowhub.domain.workflow.security.dto.request.LoginRequest;
import com.workflowhub.domain.workflow.security.dto.request.RefreshTokenRequest;
import com.workflowhub.domain.workflow.security.dto.response.AuthResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface ISecurityService {

    AuthResponse login(LoginRequest request);

    AuthResponse loginGoogle(GoogleLoginRequest request);

    String getGoogleAuthUrl(String redirectUri, String clientFrontendUrl);

    void handleGoogleCallback(String code, String redirectUri, String state, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException;

    void changePassword(ChangePasswordRequest request);

    void logout(HttpServletRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);
}

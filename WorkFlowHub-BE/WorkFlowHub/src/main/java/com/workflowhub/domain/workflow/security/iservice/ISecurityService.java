package com.workflowhub.domain.workflow.security.iservice;

import com.workflowhub.domain.workflow.security.dto.request.ChangePasswordRequest;
import com.workflowhub.domain.workflow.security.dto.request.LoginRequest;
import com.workflowhub.domain.workflow.security.dto.request.RefreshTokenRequest;
import com.workflowhub.domain.workflow.security.dto.response.AuthResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface ISecurityService {

    AuthResponse login(LoginRequest request);

    void changePassword(ChangePasswordRequest request);

    void logout(HttpServletRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);
}

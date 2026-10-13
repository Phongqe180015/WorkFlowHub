package com.workflowhub.domain.workflow.security.jwt;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.workflowhub.common.constant.SecurityConstants;
import com.workflowhub.common.exception.UnauthorizedException;
import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.common.enums.RoleEnums;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
public class JwtTokenProvider {

    public static final String ROLE_USER = "ROLE_USER";
    @Value("${security.jwt.secret-key:${jwt.secret:workflowhub-secret-key-must-be-at-least-256-bits-long-for-hmac-sha256-security!}}")
    private String secretKey;

    @Getter
    @Value("${security.jwt.access-token-expiration:1800000}")
    private long accessTokenExpirationMs;

    @Getter
    @Value("${security.jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpirationMs;

    private JWSSigner signer;
    private JWSVerifier verifier;

    @PostConstruct
    public void init() {
        try {
            byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
            this.signer = new MACSigner(keyBytes);
            this.verifier = new MACVerifier(keyBytes);
        } catch (Exception e) {
            log.error("Failed to initialize JWT signer/verifier", e);
            throw new IllegalStateException("JWT initialization failed", e);
        }
    }

    public String generateAccessToken(UsersEntity user) {
        String roleName = (user.getRole() != null && user.getRole().getName() != null)
                ? user.getRole().getName()
                : RoleEnums.USER.getRoleName();
        return generateToken(user, accessTokenExpirationMs, List.of(roleName));
    }

    public String generateRefreshToken(UsersEntity user) {
        return generateToken(user, refreshTokenExpirationMs, Collections.emptyList());
    }

    public String generateToken(UsersEntity user, long expirationMs, List<String> roles) {
        try {
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + expirationMs);

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getEmail())
                    .issuer("WorkFlowHub")
                    .issueTime(now)
                    .expirationTime(expiryDate)
                    .claim(SecurityConstants.JWT_CLAIM_USER_ID, user.getId())
                    .claim(SecurityConstants.JWT_CLAIM_EMAIL, user.getEmail())
                    .claim(SecurityConstants.JWT_CLAIM_ROLES, roles)
                    .build();

            SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claimsSet);
            signedJWT.sign(signer);
            return signedJWT.serialize();
        } catch (Exception e) {
            log.error("Failed to generate JWT token", e);
            throw new UnauthorizedException("Could not generate token");
        }
    }

    public boolean validateToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            if (!signedJWT.verify(verifier)) {
                log.warn("JWT signature verification failed");
                return false;
            }
            Date expiration = signedJWT.getJWTClaimsSet().getExpirationTime();
            return expiration != null && !expiration.before(new Date());
        } catch (Exception e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public JWTClaimsSet getClaims(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet();
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid JWT token claims");
        }
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        Object userId = getClaims(token).getClaim(SecurityConstants.JWT_CLAIM_USER_ID);
        if (userId instanceof Number number) {
            return number.longValue();
        } else if (userId instanceof String str) {
            return Long.parseLong(str);
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Object roles = getClaims(token).getClaim(SecurityConstants.JWT_CLAIM_ROLES);
        if (roles instanceof List<?> list) {
            return (List<String>) list;
        }
        return Collections.emptyList();
    }

    public Instant getExpirationDate(String token) {
        Date expiration = getClaims(token).getExpirationTime();
        return expiration != null ? expiration.toInstant() : Instant.now().plusMillis(accessTokenExpirationMs);
    }

    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(SecurityConstants.AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(SecurityConstants.BEARER_PREFIX)) {
            return bearerToken.substring(SecurityConstants.BEARER_PREFIX.length()).trim();
        }
        return null;
    }
}

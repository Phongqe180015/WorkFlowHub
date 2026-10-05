package com.workflowhub.domain.workflow.security.jwt;

import com.workflowhub.domain.master.entity.UsersEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "secretKey", "workflowhub-secret-key-must-be-at-least-256-bits-long-for-hmac-sha256-security!");
        ReflectionTestUtils.setField(jwtTokenProvider, "accessTokenExpirationMs", 3600000L);
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshTokenExpirationMs", 7200000L);
        jwtTokenProvider.init();
    }

    @Test
    void shouldGenerateAndValidateAccessToken() {
        UsersEntity user = new UsersEntity();
        user.setId(1L);
        user.setEmail("test@workflowhub.com");
        user.setName("Test User");

        String token = jwtTokenProvider.generateAccessToken(user);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("test@workflowhub.com", jwtTokenProvider.extractEmail(token));
        assertEquals(1L, jwtTokenProvider.extractUserId(token));
        assertTrue(jwtTokenProvider.extractRoles(token).contains("ROLE_USER"));
    }

    @Test
    void shouldReturnFalseForInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.here"));
    }
}

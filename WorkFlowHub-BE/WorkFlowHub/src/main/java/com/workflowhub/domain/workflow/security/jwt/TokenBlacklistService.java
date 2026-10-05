package com.workflowhub.domain.workflow.security.jwt;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final Map<String, Instant> blacklist = new ConcurrentHashMap<>();

    public void blacklistToken(String token, Instant expirationTime) {
        if (token != null && expirationTime != null) {
            blacklist.put(token, expirationTime);
        }
        cleanupIfNecessary();
    }

    public boolean isBlacklisted(String token) {
        if (token == null) {
            return false;
        }
        Instant expiration = blacklist.get(token);
        if (expiration == null) {
            return false;
        }
        if (expiration.isBefore(Instant.now())) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }

    private void cleanupIfNecessary() {
        if (blacklist.size() > 500) {
            Instant now = Instant.now();
            blacklist.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
        }
    }
}

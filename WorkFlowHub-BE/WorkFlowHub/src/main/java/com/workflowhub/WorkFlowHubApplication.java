package com.workflowhub;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

import java.util.TimeZone;

@SpringBootApplication
@RequiredArgsConstructor
@Slf4j
public class WorkFlowHubApplication {

    private final Environment env;

    public static void main(String[] args) {
        SpringApplication.run(WorkFlowHubApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void afterStartup() {
        log.info(">>> -------------------------------");
        log.info(">>> Application is running");
        log.info(">>> Port        : {}", env.getProperty("server.port"));
        log.info(">>> Profile     : {}", env.getProperty("spring.profiles.active"));
        log.info(">>> TimeZone    : {}", TimeZone.getDefault().getID());
        log.info(">>> -------------------------------");
    }
}

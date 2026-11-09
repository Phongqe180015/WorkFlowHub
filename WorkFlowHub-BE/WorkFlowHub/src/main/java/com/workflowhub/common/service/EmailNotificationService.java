package com.workflowhub.common.service;

import com.workflowhub.common.config.MailConfig;
import com.workflowhub.common.util.SecurityUtils;
import com.workflowhub.domain.master.entity.UsersEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.security.auth.AuthenticationContext;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;
    private final MailConfig mailConfig;

    public void sendTaskAssigned(UsersEntity recipient, String taskTitle, Long taskId, Long actorId) {
        if (isSelf(recipient, actorId)) {
            return;
        }
        send(
                recipient,
                "You have been assigned a task",
                "You have been assigned the task \"" + safe(taskTitle) + "\".\n\n"
                        + "Open task: " + taskLink(taskId)
        );
    }

    public void sendSubtaskAssigned(UsersEntity recipient, String subtaskTitle, String taskTitle, Long taskId, Long subtaskId, Long actorId) {
        if (isSelf(recipient, actorId)) {
            return;
        }
        send(
                recipient,
                "You have been assigned a subtask",
                "You have been assigned the subtask \"" + safe(subtaskTitle)
                        + "\" in task \"" + safe(taskTitle) + "\".\n\n"
                        + "Open subtask: " + subtaskLink(taskId, subtaskId)
        );
    }

    public void sendCommentMention(
            UsersEntity recipient,
            String commenterName,
            String content,
            Long taskId,
            Long subtaskId,
            Long actorId
    ) {
        if (isSelf(recipient, actorId)) {
            return;
        }
        String targetType = subtaskId != null ? "subtask" : "task";
        String targetLink = subtaskId != null
                ? subtaskLink(taskId, subtaskId)
                : taskLink(taskId);
        send(
                recipient,
                "You were mentioned in a comment",
                safe(commenterName) + " mentioned you in a " + targetType + " comment:\n\n"
                        + "\"" + safe(content) + "\"\n\n"
                        + "Open " + targetType + ": " + targetLink
        );
    }

    private void send(UsersEntity recipient, String subject, String text) {
        if (!mailConfig.enabled()) {
            log.debug("Email notifications are disabled; skipping email to user {}", userId(recipient));
            return;
        }
        if (recipient == null || recipient.getEmail() == null || recipient.getEmail().isBlank()) {
            log.warn("Skipping email notification because recipient email is missing for user {}", userId(recipient));
            return;
        }

        try {
            configMailToSend(recipient, subject, text);
        } catch (MailException | IllegalArgumentException ex) {
            log.error("Failed to send email notification to user {} for subject '{}'",
                    recipient.getId(), subject, ex);
        }
    }

    private void configMailToSend(UsersEntity recipient, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (mailConfig.from() != null && !mailConfig.from().isBlank()) {
            message.setFrom(mailConfig.from());
        }
        message.setTo(recipient.getEmail());
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
        log.info("Email notification sent to user {} for subject '{}'", recipient.getId(), subject);
    }

    private boolean isSelf(UsersEntity recipient, Long actorId) {
        return recipient != null && recipient.getId() != null && recipient.getId().equals(actorId);
    }

    private String taskLink(Long taskId) {
        return mailConfig.frontendUrl() + "#/tasks/" + taskId;
    }

    private String subtaskLink(Long taskId, Long subtaskId) {
        return mailConfig.frontendUrl() + "#/tasks/" + taskId + "/subtasks/" + subtaskId;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private Long userId(UsersEntity recipient) {
        return recipient == null ? null : recipient.getId();
    }
}

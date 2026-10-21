package com.workflowhub.domain.workflow.main.event.producer;

import com.workflowhub.common.config.KafkaConfig;
import com.workflowhub.domain.workflow.main.dto.request.CreateNotificationRequest;
import com.workflowhub.domain.workflow.main.event.dto.TaskAssignedEvent;
import com.workflowhub.domain.workflow.main.iservice.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Component
public class TaskEventProducer {

    public static final String TASK_ASSIGNED = "TaskAssigned";
    public static final String SUBTASK_ASSIGNED = "SubtaskAssigned";
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final INotificationService notificationService;

    public void sendTaskAssignedEvent(Long taskId, String taskTitle, Long projectId, Long assigneeId, Long actorId) {
        TaskAssignedEvent event = TaskAssignedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(TASK_ASSIGNED)
                .eventVersion(1)
                .occurredAt(Instant.now())
                .taskId(taskId)
                .taskTitle(taskTitle)
                .projectId(projectId)
                .assigneeId(assigneeId)
                .actorId(actorId)
                .build();
        log.info("==> [KAFKA PRODUCER] Publishing TaskAssigned event to topic '{}' for Task ID: {}",
                KafkaConfig.TASK_EVENTS_TOPIC, taskId);
        try {
            // Publish events to Kafka using `taskId` as the key (ensuring ordering for the same task)
            kafkaTemplate.send(KafkaConfig.TASK_EVENTS_TOPIC, String.valueOf(taskId), event)
                    .whenComplete((result, ex) -> {
                        if (ObjectUtils.isNotEmpty(ex)) {
                            log.error("==> [KAFKA PRODUCER] Failed to publish TaskAssigned event for Task ID: {}", taskId, ex);
                            fallbackCreateNotification(event, false);
                        } else {
                            log.info("==> [KAFKA PRODUCER] Successfully published TaskAssigned event for Task ID: {} to partition {} with offset {}",
                                    taskId,
                                    result.getRecordMetadata().partition(),
                                    result.getRecordMetadata().offset());
                        }
                    });
        } catch (Exception ex) {
            log.error("==> [KAFKA PRODUCER] Synchronous error when publishing TaskAssigned event for Task ID {}: {}", taskId, ex.getMessage());
            fallbackCreateNotification(event, false);
        }
    }

    public void sendSubtaskAssignedEvent(Long subtaskId, String subtaskTitle, Long taskId, String taskTitle, Long projectId, Long assigneeId, Long actorId) {
        TaskAssignedEvent event = TaskAssignedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(SUBTASK_ASSIGNED)
                .eventVersion(1)
                .occurredAt(Instant.now())
                .subtaskId(subtaskId)
                .subtaskTitle(subtaskTitle)
                .taskId(taskId)
                .taskTitle(taskTitle)
                .projectId(projectId)
                .assigneeId(assigneeId)
                .actorId(actorId)
                .build();
        log.info("==> [KAFKA PRODUCER] Publishing SubtaskAssigned event to topic '{}' for Subtask ID: {}, Task ID: {}",
                KafkaConfig.TASK_EVENTS_TOPIC, subtaskId, taskId);
        try {
            kafkaTemplate.send(KafkaConfig.TASK_EVENTS_TOPIC, String.valueOf(taskId), event)
                    .whenComplete((result, ex) -> {
                        if (ObjectUtils.isNotEmpty(ex)) {
                            log.error("==> [KAFKA PRODUCER] Failed to publish SubtaskAssigned event for Subtask ID: {}", subtaskId, ex);
                            fallbackCreateNotification(event, true);
                        } else {
                            log.info("==> [KAFKA PRODUCER] Successfully published SubtaskAssigned event for Subtask ID: {} to partition {} with offset {}",
                                    subtaskId,
                                    result.getRecordMetadata().partition(),
                                    result.getRecordMetadata().offset());
                        }
                    });
        } catch (Exception ex) {
            log.error("==> [KAFKA PRODUCER] Synchronous error when publishing SubtaskAssigned event for Subtask ID {}: {}", subtaskId, ex.getMessage());
            fallbackCreateNotification(event, true);
        }
    }

    private void fallbackCreateNotification(TaskAssignedEvent event, boolean isSubtask) {
        if (ObjectUtils.isEmpty(event) || ObjectUtils.isEmpty(event.getAssigneeId())) {
            return;
        }
        try {
            log.info("==> [FALLBACK] Kafka unavailable. Creating notification directly in database for User ID: {}", event.getAssigneeId());
            String notifyType = (isSubtask ? "SUBTASK_ASSIGNED" : "TASK_ASSIGNED")
                    + (event.getTaskId() != null ? (":" + event.getTaskId()) : "");
            String notifyContent;
            if (isSubtask) {
                if (ObjectUtils.isNotEmpty(event.getTaskTitle()) && !event.getTaskTitle().isBlank()) {
                    notifyContent = "You have been assigned a subtask: \"" + event.getSubtaskTitle() + "\" in task: \"" + event.getTaskTitle() + "\"";
                } else {
                    notifyContent = "You have been assigned a subtask: \"" + event.getSubtaskTitle() + "\"";
                }
            } else {
                notifyContent = "You have been assigned a task: \"" + event.getTaskTitle() + "\"";
            }
            CreateNotificationRequest notificationRequest = CreateNotificationRequest.builder()
                    .userId(event.getAssigneeId())
                    .type(notifyType)
                    .content(notifyContent)
                    .isRead(false)
                    .build();
            notificationService.create(notificationRequest);
            log.info("==> [FALLBACK] Successfully created notification in database for User ID: {}", event.getAssigneeId());
        } catch (Exception e) {
            log.error("==> [FALLBACK] Failed to create notification directly: {}", e.getMessage(), e);
        }
    }

}

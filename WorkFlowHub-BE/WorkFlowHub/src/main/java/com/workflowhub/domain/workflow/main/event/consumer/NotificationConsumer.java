package com.workflowhub.domain.workflow.main.event.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflowhub.common.config.KafkaConfig;
import com.workflowhub.domain.workflow.main.dto.request.CreateNotificationRequest;
import com.workflowhub.domain.workflow.main.event.dto.TaskAssignedEvent;
import com.workflowhub.domain.workflow.main.event.producer.TaskEventProducer;
import com.workflowhub.domain.workflow.main.iservice.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final INotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(
            topics = KafkaConfig.TASK_EVENTS_TOPIC,
            groupId = "${spring.kafka.consumer.group-id:workflowhub-notification-group}"
    )
    public void consumerTaskAssigned(Object message) {
        if (ObjectUtils.isEmpty(message)) {
            log.warn("==> [KAFKA CONSUMER] Received null message (possibly deserialization error or tombstone)");
            return;
        }

        try {
            // If Spring Kafka passes the ConsumerRecord envelope, extract its value (payload)
            Object payload = (message instanceof ConsumerRecord<?, ?> record) ? record.value() : message;
            if (ObjectUtils.isEmpty(payload)) {
                log.warn("==> [KAFKA CONSUMER] Received null payload in Kafka record");
                return;
            }

            TaskAssignedEvent event = getTaskAssignedEvent(payload);

            boolean isSubtask = TaskEventProducer.SUBTASK_ASSIGNED.equalsIgnoreCase(event.getEventType()) || event.getSubtaskId() != null;
            if (isSubtask) {
                log.info("==> [KAFKA CONSUMER] Received SubtaskAssigned event for User ID: {}, Subtask ID: {}, Subtask: '{}', Task ID: {}",
                        event.getAssigneeId(), event.getSubtaskId(), event.getSubtaskTitle(), event.getTaskId());
            } else {
                log.info("==> [KAFKA CONSUMER] Received TaskAssigned event for User ID: {}, Task ID: {}, Task: '{}'",
                        event.getAssigneeId(), event.getTaskId(), event.getTaskTitle());
            }

            // Automatically create notification records in PostgreSQL
            createNotification(event, isSubtask);

            log.info("==> [KAFKA CONSUMER] Successfully created a notification in the database for the User ID: {}", event.getAssigneeId());

        }catch (Exception e) {
            log.error("Error while processing Kafka event in NotificationConsumer: {}", e.getMessage(), e);
        }
    }

    private void createNotification(TaskAssignedEvent event, boolean isSubtask) {
        String notifType = isSubtask ? "SUBTASK_ASSIGNED" : "TASK_ASSIGNED";
        String notifContent;
        if (isSubtask) {
            if (ObjectUtils.isNotEmpty(event.getTaskTitle()) && !event.getTaskTitle().isBlank()) {
                notifContent = "You have been assigned a subtask: \"" + event.getSubtaskTitle() + "\" in task: \"" + event.getTaskTitle() + "\"";
            } else {
                notifContent = "You have been assigned a subtask: \"" + event.getSubtaskTitle() + "\"";
            }
        } else {
            notifContent = "You have been assigned a task: \"" + event.getTaskTitle() + "\"";
        }

        CreateNotificationRequest notificationRequest = CreateNotificationRequest.builder()
                .userId(event.getAssigneeId())
                .type(notifType)
                .content(notifContent)
                .isRead(false)
                .build();
        notificationService.create(notificationRequest);
    }

    private TaskAssignedEvent getTaskAssignedEvent(Object payload) throws JsonProcessingException {
        TaskAssignedEvent event;
        if (payload instanceof TaskAssignedEvent typedEvent) {
            event = typedEvent;
        } else if (payload instanceof String jsonStr) {
            event = objectMapper.readValue(jsonStr, TaskAssignedEvent.class);
        } else {
            // Secure deserialization from a JSON Map
            event = objectMapper.convertValue(payload, TaskAssignedEvent.class);
        }
        return event;
    }
}

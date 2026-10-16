package com.workflowhub.domain.workflow.main.event.producer;

import com.workflowhub.common.config.KafkaConfig;
import com.workflowhub.domain.workflow.main.event.dto.TaskAssignedEvent;
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
        // Publish events to Kafka using `taskId` as the key (ensuring ordering for the same task)
        kafkaTemplate.send(KafkaConfig.TASK_EVENTS_TOPIC, String.valueOf(taskId), event)
                .whenComplete((result, ex) -> {
                    if (ObjectUtils.isNotEmpty(ex)) {
                        log.error("==> [KAFKA PRODUCER] Failed to publish TaskAssigned event for Task ID: {}", taskId, ex);
                    } else {
                        log.info("==> [KAFKA PRODUCER] Successfully published TaskAssigned event for Task ID: {} to partition {} with offset {}",
                                taskId,
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset());
                    }
                });
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
        kafkaTemplate.send(KafkaConfig.TASK_EVENTS_TOPIC, String.valueOf(taskId), event)
                .whenComplete((result, ex) -> {
                    if (ObjectUtils.isNotEmpty(ex)) {
                        log.error("==> [KAFKA PRODUCER] Failed to publish SubtaskAssigned event for Subtask ID: {}", subtaskId, ex);
                    } else {
                        log.info("==> [KAFKA PRODUCER] Successfully published SubtaskAssigned event for Subtask ID: {} to partition {} with offset {}",
                                subtaskId,
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset());
                    }
                });
    }

}

package com.workflowhub.domain.workflow.main.event.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskAssignedEvent implements Serializable {

    private static final long serialVersionUID = 1L;
    private String eventId;
    private String eventType;   // "TaskAssigned"
    private int eventVersion;   // 1
    private Instant occurredAt;

    private Long taskId;
    private String taskTitle;
    private Long subtaskId;
    private String subtaskTitle;
    private Long projectId;
    private Long assigneeId;
    private Long actorId;
}

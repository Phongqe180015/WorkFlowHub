package com.workflowhub.domain.workflow.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {

    private Long id;
    private Long projectId;
    private String projectName;
    private Long sprintId;
    private String sprintName;
    private Long assigneeId;
    private String assigneeName;
    private String title;
    private String description;
    private String estimate;
    private String priority;
    private String status;
    private LocalDate dueDate;
    private String taskCode;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.workflowhub.domain.workflow.main.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTaskRequest {

    private Long projectId;

    private Long assigneeId;

    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    private String description;

    @Size(max = 50, message = "Priority cannot exceed 50 characters")
    private String priority;

    @Size(max = 50, message = "Status cannot exceed 50 characters")
    private String status;

    private LocalDate dueDate;
}

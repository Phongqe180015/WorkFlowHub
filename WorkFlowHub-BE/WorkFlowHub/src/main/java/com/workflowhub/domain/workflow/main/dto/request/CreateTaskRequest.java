package com.workflowhub.domain.workflow.main.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateTaskRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private Long sprintId;

    private Long assigneeId;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    private String description;

    @Size(max = 50, message = "Priority cannot exceed 50 characters")
    private String priority;

    @Size(max = 50, message = "Status cannot exceed 50 characters")
    private String status;

    private LocalDate dueDate;
}

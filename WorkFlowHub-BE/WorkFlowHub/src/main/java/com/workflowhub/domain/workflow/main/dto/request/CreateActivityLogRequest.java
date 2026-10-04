package com.workflowhub.domain.workflow.main.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateActivityLogRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    private Long projectId;

    @NotBlank(message = "Action is required")
    @Size(max = 255, message = "Action cannot exceed 255 characters")
    private String action;
}

package com.workflowhub.domain.workflow.main.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateCommentRequest {

    @NotNull(message = "Task ID is required")
    private Long taskId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Content is required")
    private String content;
}

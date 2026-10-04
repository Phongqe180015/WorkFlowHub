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
public class CreateNotificationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Type is required")
    @Size(max = 100, message = "Type cannot exceed 100 characters")
    private String type;

    @NotBlank(message = "Content is required")
    private String content;

    private Boolean isRead = false;
}

package com.workflowhub.domain.workflow.main.dto.request;

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
public class UpdateSubtaskRequest {

    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @Size(max = 400, message = "Description cannot exceed 400 characters")
    private String description;

    private Boolean isCompleted;
}

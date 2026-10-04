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
public class UpdateActivityLogRequest {

    @Size(max = 255, message = "Action cannot exceed 255 characters")
    private String action;
}

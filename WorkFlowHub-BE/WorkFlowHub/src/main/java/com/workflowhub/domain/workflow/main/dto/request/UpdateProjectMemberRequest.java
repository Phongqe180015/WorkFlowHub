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
public class UpdateProjectMemberRequest {

    @Size(max = 100, message = "Role cannot exceed 100 characters")
    private String role;
}

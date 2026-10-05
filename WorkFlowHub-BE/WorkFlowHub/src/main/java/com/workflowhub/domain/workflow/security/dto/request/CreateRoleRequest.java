package com.workflowhub.domain.workflow.security.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class CreateRoleRequest {

    @NotBlank(message = "Role name is required")
    @Size(max = 100, message = "Role name cannot exceed 100 characters")
    private String name;
}

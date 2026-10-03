package com.workflowhub.domain.workflow.security.dto.request;

import jakarta.validation.constraints.Email;
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
public class UpdateUserRequest {

    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email cannot exceed 255 characters")
    private String email;

    @Size(min = 6, max = 255, message = "Password must be at least 6 characters")
    private String password;

    @Size(max = 255, message = "Name cannot exceed 255 characters")
    private String name;

    private String avatar;

    private String status;
}

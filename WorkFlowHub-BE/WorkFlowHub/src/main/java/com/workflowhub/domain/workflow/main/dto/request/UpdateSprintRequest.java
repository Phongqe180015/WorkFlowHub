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
public class UpdateSprintRequest {

    private Long projectId;

    @Size(max = 255, message = "Name cannot exceed 255 characters")
    private String name;

    private String goal;

    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 30, message = "Status cannot exceed 30 characters")
    private String status;
}

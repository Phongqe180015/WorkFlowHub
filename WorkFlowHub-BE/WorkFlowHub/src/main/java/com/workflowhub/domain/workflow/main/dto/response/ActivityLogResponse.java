package com.workflowhub.domain.workflow.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogResponse {

    private Long id;
    private Long userId;
    private String userName;
    private Long projectId;
    private String projectName;
    private String action;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

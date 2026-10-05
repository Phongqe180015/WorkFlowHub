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
public class ProjectMemberResponse {

    private Long projectId;
    private String projectName;
    private Long userId;
    private String userName;
    private Long roleId;
    private String roleName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

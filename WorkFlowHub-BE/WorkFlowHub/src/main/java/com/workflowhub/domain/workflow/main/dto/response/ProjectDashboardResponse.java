package com.workflowhub.domain.workflow.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDashboardResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long projectId;
    private String projectName;
    private String projectDescription;
    private String ownerName;
    private long totalMembers;
    private long totalTasks;
    private long completedTasks;
    private double completionRate;
    private long overdueTasks;
    private String activeSprintName;
    private Map<String, Long> tasksByStatus;
}

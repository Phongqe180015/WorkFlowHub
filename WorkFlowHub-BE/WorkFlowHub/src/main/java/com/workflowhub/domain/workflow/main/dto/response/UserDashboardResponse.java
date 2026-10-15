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
public class UserDashboardResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long userId;
    private long totalProjects;
    private long totalAssignedTasks;
    private long overdueTasks;
    private Map<String, Long> tasksByStatus; // VD: {"pending": 3, "in_progress": 2, "completed": 5}
}
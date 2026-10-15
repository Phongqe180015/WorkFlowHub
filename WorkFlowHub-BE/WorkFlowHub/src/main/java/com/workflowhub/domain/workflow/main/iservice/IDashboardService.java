package com.workflowhub.domain.workflow.main.iservice;

import com.workflowhub.domain.workflow.main.dto.response.ProjectDashboardResponse;
import com.workflowhub.domain.workflow.main.dto.response.UserDashboardResponse;

public interface IDashboardService {
    UserDashboardResponse getUserDashboard(Long userId);
    ProjectDashboardResponse getProjectDashboard(Long projectId);
}

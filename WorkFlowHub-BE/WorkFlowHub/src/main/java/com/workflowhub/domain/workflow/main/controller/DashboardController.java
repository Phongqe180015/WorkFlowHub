package com.workflowhub.domain.workflow.main.controller;

import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.controller.BaseController;
import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.common.util.SecurityUtils;
import com.workflowhub.domain.workflow.main.dto.response.ProjectDashboardResponse;
import com.workflowhub.domain.workflow.main.dto.response.UserDashboardResponse;
import com.workflowhub.domain.workflow.main.iservice.IDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(AppConstants.API_PREFIX + "/dashboard")
@RequiredArgsConstructor
public class DashboardController extends BaseController {

    private final IDashboardService dashboardService;

    @GetMapping("/user")
    public ApiResponse<UserDashboardResponse> getMyDashboard() {
        Long userId = SecurityUtils.getCurrentUserId();
        return success(dashboardService.getUserDashboard(userId));
    }

    @GetMapping("/project/{projectId}")
    public ApiResponse<ProjectDashboardResponse> getProjectDashboard(@PathVariable Long projectId) {
        return success(dashboardService.getProjectDashboard(projectId));
    }
}

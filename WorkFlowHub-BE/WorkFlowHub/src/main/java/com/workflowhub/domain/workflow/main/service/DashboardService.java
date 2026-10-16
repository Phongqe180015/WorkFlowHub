package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.config.RedisConfig;
import com.workflowhub.domain.workflow.main.dto.response.UserDashboardResponse;
import com.workflowhub.domain.workflow.main.irepository.IProjectMemberRepository;
import com.workflowhub.domain.workflow.main.irepository.ITaskRepository;
import com.workflowhub.domain.workflow.main.iservice.IDashboardService;
import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.domain.master.entity.ProjectEntity;
import com.workflowhub.domain.master.irepository.IProjectRepository;
import com.workflowhub.domain.workflow.main.dto.response.ProjectDashboardResponse;
import com.workflowhub.domain.workflow.main.entity.SprintEntity;
import com.workflowhub.domain.workflow.main.irepository.ISprintRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardService implements IDashboardService {

    private final ITaskRepository taskRepository;
    private final IProjectMemberRepository projectMemberRepository;
    private final IProjectRepository projectRepository;
    private final ISprintRepository sprintRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = RedisConfig.CACHE_USER_DASHBOARD, key = "#userId")
    public UserDashboardResponse getUserDashboard(Long userId) {

        log.info("==> [CACHE MISS] PostgreSQL query for calculating dashboard data for a User ID: {}", userId);

        long totalProjects = projectMemberRepository.countProjectsByUserId(userId);
        long totalTasks = taskRepository.countAssignedTasks(userId);
        long overdueTasks = taskRepository.countOverdueTasks(userId, LocalDate.now());

        List<Object[]> statusCounts = taskRepository.countTasksByStatusForUser(userId);
        Map<String, Long> taskByStatus = new HashMap<>();
        for (Object[] row : statusCounts) {
            String status = (String) row[0];
            Long count = (Long) row[1];
            taskByStatus.put(status, count);
        }
        return UserDashboardResponse.builder()
                .userId(userId)
                .totalProjects(totalProjects)
                .totalAssignedTasks(totalTasks)
                .overdueTasks(overdueTasks)
                .tasksByStatus(taskByStatus)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = RedisConfig.CACHE_PROJECT_DASHBOARD, key = "#projectId")
    public ProjectDashboardResponse getProjectDashboard(Long projectId) {
        log.info("==> [CACHE MISS] PostgreSQL query for calculating dashboard data for a Project ID: {}", projectId);

        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> NotFoundException.of("Project", projectId));

        long totalMembers = projectMemberRepository.countMembersByProjectId(projectId);
        long totalTasks = taskRepository.countTasksByProjectId(projectId);
        long completedTasks = taskRepository.countCompletedTasksByProjectId(projectId);
        long overdueTasks = taskRepository.countOverdueTasksByProjectId(projectId, LocalDate.now());

        double completionRate = totalTasks > 0 ? ((double) completedTasks / totalTasks) * 100.0 : 0.0;
        completionRate = Math.round(completionRate * 100.0) / 100.0;

        String activeSprintName = sprintRepository.findFirstByProjectIdAndStatusIgnoreCase(projectId, "ACTIVE")
                .map(SprintEntity::getName)
                .orElse(null);

        List<Object[]> statusCounts = taskRepository.countTasksByStatusForProject(projectId);
        Map<String, Long> taskByStatus = new HashMap<>();
        for (Object[] row : statusCounts) {
            String status = (String) row[0];
            Long count = (Long) row[1];
            taskByStatus.put(status, count);
        }

        String ownerName = project.getOwner() != null ? project.getOwner().getName() : null;

        return ProjectDashboardResponse.builder()
                .projectId(projectId)
                .projectName(project.getName())
                .projectDescription(project.getDescription())
                .ownerName(ownerName)
                .totalMembers(totalMembers)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .completionRate(completionRate)
                .overdueTasks(overdueTasks)
                .activeSprintName(activeSprintName)
                .tasksByStatus(taskByStatus)
                .build();
    }
}

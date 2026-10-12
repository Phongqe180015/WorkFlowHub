package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.enums.RoleEnums;
import com.workflowhub.common.exception.ForbiddenException;
import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.exception.UnauthorizedException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.common.util.SecurityUtils;
import com.workflowhub.domain.workflow.main.dto.request.CreateTaskRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateTaskRequest;
import com.workflowhub.domain.workflow.main.dto.response.TaskResponse;
import com.workflowhub.domain.workflow.main.entity.TaskEntity;
import com.workflowhub.domain.workflow.main.entity.key.ProjectMemberId;
import com.workflowhub.domain.workflow.main.irepository.IProjectMemberRepository;
import com.workflowhub.domain.workflow.main.irepository.ITaskRepository;
import com.workflowhub.domain.workflow.main.iservice.ITaskService;
import com.workflowhub.domain.workflow.main.mapper.ITaskMapper;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.workflowhub.common.constant.CharacterConstants.SEMICOLON;
import static com.workflowhub.common.constant.MessageCodeSystem.INVALID_AUTHEN_TASK_STATUS;
import static com.workflowhub.common.constant.MessageCodeSystem.INVALID_UPDATE_TASK_STATUS;
import static com.workflowhub.common.constant.MessageConstants.TASK;

@Service
@RequiredArgsConstructor
public class TaskService implements ITaskService {

    private static final RsqlSpecificationBuilder<TaskEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(TaskEntity.class)
                    .field("projectId",  "project.id",  Long.class)   // ManyToOne dot-path
                    .field("assigneeId", "assignee.id", Long.class)   // ManyToOne dot-path
                    .field("sprintId",   "sprint.id",   Long.class)   // ManyToOne dot-path
                    .field("taskCode",   "taskCode",    String.class)
                    .field("status",     "status",      String.class)
                    .field("priority",   "priority",    String.class)
                    .field("isDeleted",  "isDeleted",   Boolean.class)
                    .build();
    public static final String IS_DELETED_FALSE = "isDeleted==false";
    private final ITaskRepository repository;
    private final ITaskMapper taskMapper;
    private final IProjectMemberRepository projectMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getPage(String search, Pageable pageable) {
        String effectiveSearch = search;
        if (effectiveSearch == null || !effectiveSearch.contains("isDeleted")) {
            effectiveSearch = (ObjectUtils.isEmpty(effectiveSearch))
                    ? IS_DELETED_FALSE
                    : effectiveSearch + SEMICOLON + IS_DELETED_FALSE;
        }
        Specification<TaskEntity> spec = RSQL_BUILDER.parse(effectiveSearch);
        return repository.findAll(spec, pageable).map(taskMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        TaskEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(TASK, id));
        return taskMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        TaskEntity entity = taskMapper.toEntity(request);
        if (ObjectUtils.isEmpty(entity.getIsDeleted())) {
            entity.setIsDeleted(false);
        }
        if (ObjectUtils.isEmpty(entity.getTaskCode()) || entity.getTaskCode().isBlank()) {
            entity.setTaskCode("TASK-" + (System.currentTimeMillis() % 100000));
        }
        TaskEntity saved = repository.save(entity);
        return taskMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long id, UpdateTaskRequest request) {
        TaskEntity existing = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(TASK, id));

        handleUpdateStatus(request, existing);

        taskMapper.updateEntityFromRequest(request, existing);
        TaskEntity saved = repository.save(existing);
        return taskMapper.toResponse(saved);
    }

    private void handleUpdateStatus(UpdateTaskRequest request, TaskEntity existing) {
        if (ObjectUtils.isNotEmpty(request.getStatus()) && !request.getStatus().equalsIgnoreCase(existing.getStatus())) {
            Long currentUserId = null;
            try {
                currentUserId = SecurityUtils.getCurrentUserId();
            } catch (Exception ignored) {
            }

            Authentication auth = validateAuthen();

            boolean isPM = handleValidateRole(existing, auth, currentUserId);

            boolean isAssignee = existing.getAssignee() != null
                    && existing.getAssignee().getId().equals(currentUserId);

            if (!isPM && !isAssignee) {
                throw new ForbiddenException(INVALID_UPDATE_TASK_STATUS);
            }
        }
    }

    private boolean handleValidateRole(TaskEntity existing, Authentication auth, Long currentUserId) {
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));

        Long projectId = existing.getProject().getId();
        boolean isPM = isAdmin;
        if (!isPM && ObjectUtils.isNotEmpty(currentUserId)) {
            isPM = (existing.getProject().getOwner() != null && existing.getProject().getOwner().getId().equals(currentUserId))
                    || projectMemberRepository.findById(new ProjectMemberId(projectId, currentUserId))
                            .map(pm -> pm.getRole() != null && RoleEnums.PROJECT_MANAGER.matches(pm.getRole().getName()))
                            .orElse(false);
        }
        return isPM;
    }

    private static Authentication validateAuthen() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (ObjectUtils.isEmpty(auth) || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UnauthorizedException(INVALID_AUTHEN_TASK_STATUS);
        }
        return auth;
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        TaskEntity existing = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(TASK, id));
        existing.setIsDeleted(true);
        repository.save(existing);
    }

    @Override
    @Transactional
    public TaskResponse restoreTask(Long id) {
        TaskEntity existing = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(TASK, id));
        existing.setIsDeleted(false);
        TaskEntity saved = repository.save(existing);
        return taskMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void permanentDeleteTask(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of(TASK, id);
        }
        repository.deleteById(id);
    }
}

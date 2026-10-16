package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.enums.RoleEnums;
import com.workflowhub.common.exception.ForbiddenException;
import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.exception.UnauthorizedException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.common.util.SecurityUtils;
import com.workflowhub.domain.workflow.main.dto.request.CreateSubtaskRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateSubtaskRequest;
import com.workflowhub.domain.workflow.main.dto.response.SubtaskResponse;
import com.workflowhub.domain.workflow.main.entity.SubtaskEntity;
import com.workflowhub.domain.workflow.main.entity.TaskEntity;
import com.workflowhub.domain.workflow.main.entity.key.ProjectMemberId;
import com.workflowhub.domain.workflow.main.event.producer.TaskEventProducer;
import com.workflowhub.domain.workflow.main.irepository.IProjectMemberRepository;
import com.workflowhub.domain.workflow.main.irepository.ISubtaskRepository;
import com.workflowhub.domain.workflow.main.irepository.ITaskRepository;
import com.workflowhub.domain.workflow.main.iservice.ISubtaskService;
import com.workflowhub.domain.workflow.main.mapper.ISubtaskMapper;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.workflowhub.common.constant.MessageCodeSystem.INVALID_AUTHEN_TASK_STATUS;
import static com.workflowhub.common.constant.MessageCodeSystem.INVALID_UPDATE_TASK_STATUS;

@Service
@RequiredArgsConstructor
public class SubtaskService implements ISubtaskService {

    private static final RsqlSpecificationBuilder<SubtaskEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(SubtaskEntity.class)
                    .field("taskId", "task.id", Long.class)
                    .field("assigneeId", "assignee.id", Long.class)
                    .field("title", "title", String.class)
                    .field("priority", "priority", String.class)
                    .field("isCompleted", "isCompleted", Boolean.class)
                    .build();

    public static final String SUBTASK = "Subtask";

    private final ISubtaskRepository repository;
    private final ISubtaskMapper mapper;
    private final IProjectMemberRepository projectMemberRepository;
    private final ITaskRepository taskRepository;
    private final TaskEventProducer taskEventProducer;

    @Override
    @Transactional(readOnly = true)
    public Page<SubtaskResponse> getPage(String search, Pageable pageable) {
        Specification<SubtaskEntity> spec = RSQL_BUILDER.parse(search);
        return repository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubtaskResponse> getByTaskId(Long taskId) {
        return repository.findByTaskId(taskId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SubtaskResponse getById(Long id) {
        SubtaskEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(SUBTASK, id));
        return mapper.toResponse(entity);
    }

    @Override
    @Transactional
    public SubtaskResponse create(CreateSubtaskRequest request) {
        SubtaskEntity entity = mapper.toEntity(request);
        if (entity.getIsCompleted() == null) {
            entity.setIsCompleted(false);
        }
        SubtaskEntity savedEntity = repository.save(entity);
        handleNotificationForSubtaskCreate(savedEntity, request.getTaskId());
        return mapper.toResponse(savedEntity);
    }

    private void handleNotificationForSubtaskCreate(SubtaskEntity saved, Long taskId) {
        if (ObjectUtils.isNotEmpty(saved.getAssignee())) {
            publishSubtaskEvent(saved, taskId);
        }
    }

    @Override
    @Transactional
    public SubtaskResponse update(Long id, UpdateSubtaskRequest request) {
        SubtaskEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(SUBTASK, id));

        Long oldAssigneeId = (entity.getAssignee() != null) ? entity.getAssignee().getId() : null;

        validateBeforeUpdate(request, entity);

        mapper.updateEntityFromRequest(request, entity);
        SubtaskEntity savedEntity = repository.save(entity);
        publishWhenSubtaskUpdate(savedEntity, oldAssigneeId);
        return mapper.toResponse(savedEntity);
    }

    private void publishWhenSubtaskUpdate(SubtaskEntity saved, Long oldAssigneeId) {
        if (ObjectUtils.isNotEmpty(saved.getAssignee()) &&
                (oldAssigneeId == null || !oldAssigneeId.equals(saved.getAssignee().getId()))) {
            Long taskId = (saved.getTask() != null) ? saved.getTask().getId() : null;
            publishSubtaskEvent(saved, taskId);
        }
    }

    private void publishSubtaskEvent(SubtaskEntity saved, Long taskId) {
        if (saved.getAssignee() == null || taskId == null) {
            return;
        }

        TaskEntity task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            return;
        }

        Long taskAssigneeId = (task.getAssignee() != null) ? task.getAssignee().getId() : null;
        Long subtaskAssigneeId = saved.getAssignee().getId();

        // Only allow notifications when the subtask's assignee_id differs from the parent task's assignee_id
        if (subtaskAssigneeId.equals(taskAssigneeId)) {
            return;
        }

        Long actorId = null;
        try {
            actorId = SecurityUtils.getCurrentUserId();
        } catch (Exception ignored) {
        }

        String taskTitle = (task.getTitle() != null) ? task.getTitle() : "";
        Long projectId = (task.getProject() != null) ? task.getProject().getId() : null;

        taskEventProducer.sendSubtaskAssignedEvent(
                saved.getId(),
                saved.getTitle(),
                taskId,
                taskTitle,
                projectId,
                subtaskAssigneeId,
                actorId
        );
    }

    private void validateBeforeUpdate(UpdateSubtaskRequest request, SubtaskEntity entity) {
        handleUpdateStatus(request, entity);
        handleUpdateAssign(request, entity);
    }

    private void handleUpdateAssign(UpdateSubtaskRequest request, SubtaskEntity entity) {
        if(ObjectUtils.isNotEmpty(request.getAssigneeId()) && !request.getAssigneeId().equals(entity.getAssignee().getId())){
            validateRoles(entity);
        }
    }

    private void handleUpdateStatus(UpdateSubtaskRequest request, SubtaskEntity entity) {
        if (request.getIsCompleted() != null && !request.getIsCompleted().equals(entity.getIsCompleted())) {
            validateRoles(entity);
        }
    }

    private void validateRoles(SubtaskEntity entity) {
        Long currentUserId = null;
        try {
            currentUserId = SecurityUtils.getCurrentUserId();
        } catch (Exception ignored) {
        }

        Authentication auth = getAuthentication();

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));

        TaskEntity task = entity.getTask();
        Long projectId = task.getProject().getId();

        boolean isPM = validateRole(isAdmin, currentUserId, task, projectId);

        boolean isTaskAssignee = task.getAssignee() != null
                && task.getAssignee().getId().equals(currentUserId);

        boolean isSubtaskAssignee = entity.getAssignee() != null
                && entity.getAssignee().getId().equals(currentUserId);

        if (!isPM && !isTaskAssignee && !isSubtaskAssignee) {
            throw new ForbiddenException(INVALID_UPDATE_TASK_STATUS);
        }
    }

    private boolean validateRole(boolean isAdmin, Long currentUserId, TaskEntity task, Long projectId) {
        boolean isPM = isAdmin;
        if (!isPM && currentUserId != null) {
            isPM = (task.getProject().getOwner() != null && task.getProject().getOwner().getId().equals(currentUserId))
                    || projectMemberRepository.findById(new ProjectMemberId(projectId, currentUserId))
                            .map(pm -> pm.getRole() != null && RoleEnums.PROJECT_MANAGER.matches(pm.getRole().getName()))
                            .orElse(false);
        }
        return isPM;
    }

    private static Authentication getAuthentication() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (ObjectUtils.isEmpty(auth) || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UnauthorizedException(INVALID_AUTHEN_TASK_STATUS);
        }
        return auth;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of(SUBTASK, id);
        }
        repository.deleteById(id);
    }
}

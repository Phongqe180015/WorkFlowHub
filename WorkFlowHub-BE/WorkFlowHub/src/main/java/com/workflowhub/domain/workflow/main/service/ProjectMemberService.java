package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.enums.RoleEnums;
import com.workflowhub.common.exception.BadRequestException;
import com.workflowhub.common.exception.ForbiddenException;
import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.common.util.SecurityUtils;
import com.workflowhub.domain.master.entity.ProjectEntity;
import com.workflowhub.domain.master.irepository.IProjectRepository;
import com.workflowhub.domain.workflow.main.dto.request.CreateProjectMemberRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateProjectMemberRequest;
import com.workflowhub.domain.workflow.main.dto.response.ProjectMemberResponse;
import com.workflowhub.domain.workflow.main.entity.ProjectMemberEntity;
import com.workflowhub.domain.workflow.main.entity.key.ProjectMemberId;
import com.workflowhub.domain.workflow.main.irepository.IProjectMemberRepository;
import com.workflowhub.domain.workflow.main.iservice.IProjectMemberService;
import com.workflowhub.domain.workflow.main.mapper.IProjectMemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.workflowhub.common.constant.MessageCodeSystem.ONLY_THE_PROJECT_MANAGER_HAS_THE_AUTHORITY_TO_REMOVE_MEMBERS;
import static com.workflowhub.common.constant.MessageCodeSystem.UNABLE_TO_REMOVE_OWNER_FROM_PROJECT;
import static com.workflowhub.common.constant.MessageCodeSystem.YOU_CANNOT_REMOVE_YOURSELF_FROM_THE_PROJECT;
import static com.workflowhub.common.enums.RoleEnums.ADMIN;

@Service
@RequiredArgsConstructor
public class ProjectMemberService implements IProjectMemberService {

    private static final RsqlSpecificationBuilder<ProjectMemberEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(ProjectMemberEntity.class)
                    .field("projectId", "project.id", Long.class)
                    .field("userId",    "user.id",    Long.class)
                    .field("roleId",    "role.id",    Long.class)
                    .field("roleName",  "role.name",  String.class)
                    .build();

    public static final String PROJECT_MEMBER = "ProjectMember";

    private final IProjectMemberRepository repository;
    private final IProjectMemberMapper mapper;
    private final IProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectMemberResponse> getPage(String search, Pageable pageable) {
        Specification<ProjectMemberEntity> spec = RSQL_BUILDER.parse(search);
        return repository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectMemberResponse getById(Long projectId, Long userId) {
        ProjectMemberId id = new ProjectMemberId(projectId, userId);
        ProjectMemberEntity entity = repository.findById(id)
                .orElseThrow(() -> new NotFoundException(PROJECT_MEMBER + " not found for projectId=" + projectId + ", userId=" + userId));
        return mapper.toResponse(entity);
    }

    @Override
    @Transactional
    public ProjectMemberResponse create(CreateProjectMemberRequest request) {
        ProjectMemberEntity entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public ProjectMemberResponse update(Long projectId, Long userId, UpdateProjectMemberRequest request) {
        ProjectMemberId id = new ProjectMemberId(projectId, userId);
        ProjectMemberEntity entity = repository.findById(id)
                .orElseThrow(() -> new NotFoundException(PROJECT_MEMBER + " not found for projectId=" + projectId + ", userId=" + userId));
        mapper.updateEntityFromRequest(request, entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long projectId, Long userId) {
        ProjectMemberId id = new ProjectMemberId(projectId, userId);
        if (!repository.existsById(id)) {
            throw new NotFoundException(PROJECT_MEMBER + " not found for projectId=" + projectId + ", userId=" + userId);
        }

        Long currentUserId = SecurityUtils.getCurrentUserId();
        // 1. Do not allow yourself to erase your own image.
        isDeletedYourSelf(userId, currentUserId);
        
        // 2. Do not allow deleting the project's Owner/Creator.
        ProjectEntity project = handleNotAllowDeletedPM(projectId, userId);
        
        // 3. Check if the API caller is the Project Manager, Project Owner, or System Administrator.
        validateRoleBeforeDeletedMember(projectId, project, currentUserId);

        repository.deleteById(id);
    }

    private void validateRoleBeforeDeletedMember(Long projectId, ProjectEntity project, Long currentUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(ADMIN.getRoleName()));
        boolean isPM = isAdmin
                || (project.getOwner() != null && project.getOwner().getId().equals(currentUserId))
                || repository.findById(new ProjectMemberId(projectId, currentUserId))
                .map(pm -> pm.getRole() != null && RoleEnums.PROJECT_MANAGER.matches(pm.getRole().getName()))
                .orElse(false);
        if (!isPM) {
            throw new ForbiddenException(ONLY_THE_PROJECT_MANAGER_HAS_THE_AUTHORITY_TO_REMOVE_MEMBERS);
        }
    }

    private ProjectEntity handleNotAllowDeletedPM(Long projectId, Long userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with id=" + projectId));
        if (project.getOwner() != null && project.getOwner().getId().equals(userId)) {
            throw new BadRequestException(UNABLE_TO_REMOVE_OWNER_FROM_PROJECT);
        }
        return project;
    }

    private static void isDeletedYourSelf(Long userId, Long currentUserId) {
        if (currentUserId.equals(userId)) {
            throw new BadRequestException(YOU_CANNOT_REMOVE_YOURSELF_FROM_THE_PROJECT);
        }
    }
}

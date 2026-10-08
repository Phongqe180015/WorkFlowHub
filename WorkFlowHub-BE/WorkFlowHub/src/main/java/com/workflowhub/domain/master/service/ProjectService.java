package com.workflowhub.domain.master.service;

import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.common.util.SecurityUtils;
import com.workflowhub.domain.master.dto.request.CreateProjectRequest;
import com.workflowhub.domain.master.dto.request.UpdateProjectRequest;
import com.workflowhub.domain.master.dto.response.ProjectResponse;
import com.workflowhub.domain.master.entity.ProjectEntity;
import com.workflowhub.domain.master.iservice.IProjectService;
import com.workflowhub.domain.master.mapper.IProjectMapper;
import com.workflowhub.domain.master.irepository.IProjectRepository;
import com.workflowhub.domain.workflow.main.dto.request.CreateProjectMemberRequest;
import com.workflowhub.domain.workflow.main.entity.key.ProjectMemberId;
import com.workflowhub.domain.workflow.main.irepository.IProjectMemberRepository;
import com.workflowhub.domain.workflow.main.iservice.IProjectMemberService;
import com.workflowhub.domain.workflow.security.entity.RoleEntity;
import com.workflowhub.domain.workflow.security.irepository.IRoleRepository;
import lombok.RequiredArgsConstructor;
import com.workflowhub.common.enums.RoleEnums;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService implements IProjectService {

    private static final RsqlSpecificationBuilder<ProjectEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(ProjectEntity.class)
                    .field("ownerId", "owner.id", Long.class)  // ManyToOne dot-path: owner.id
                    .build();

    public static final String PROJECT = "Project";

    private final IProjectRepository repository;
    private final IProjectMapper projectMapper;
    private final IProjectMemberService projectMemberService;
    private final IRoleRepository roleRepository;
    private final IProjectMemberRepository projectMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectResponse> getPage(String search, Pageable pageable) {
        Specification<ProjectEntity> spec = RSQL_BUILDER.parse(search);
        return repository.findAll(spec, pageable).map(projectMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        ProjectEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(PROJECT, id));
        return projectMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request) {
        ProjectEntity entity = projectMapper.toEntity(request);
        String roleName = RoleEnums.PROJECT_MANAGER.getRoleName();
        RoleEntity roleEntity = roleRepository.findByName(roleName)
                .orElseThrow(() -> NotFoundException.of(roleName, null));
        ProjectEntity saved = repository.save(entity);
        projectMemberService.create(new CreateProjectMemberRequest(saved.getId(), saved.getOwner().getId(), roleEntity.getId()));
        return projectMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long id, UpdateProjectRequest request) {
        ProjectEntity existing = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(PROJECT, id));
        projectMapper.updateEntityFromRequest(request, existing);
        ProjectEntity saved = repository.save(existing);
        return projectMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of(PROJECT, id);
        }
        repository.deleteById(id);
    }

    @Override
    public Page<ProjectResponse> getMyProject(Pageable pageable) {

        Long currentUserId = SecurityUtils.getCurrentUserId();
        Page<ProjectEntity> projectEntities = repository.findProjectsByUserId(currentUserId, pageable);

        return getProjectResponses(projectEntities, currentUserId);
    }

    private Page<ProjectResponse> getProjectResponses(Page<ProjectEntity> projectEntities, Long currentUserId) {
        return projectEntities.map(project -> {
            ProjectResponse response = projectMapper.toResponse(project);

            setCurrentUserRoleInResponse(currentUserId, project, response);

            if (ObjectUtils.isEmpty(response.getCurrentUserRole()) && project.getOwner().getId().equals(currentUserId)) {
                response.setCurrentUserRole(RoleEnums.PROJECT_MANAGER.getRoleName());
            }

            return response;
        });
    }

    private void setCurrentUserRoleInResponse(Long currentUserId, ProjectEntity project, ProjectResponse response) {
        projectMemberRepository.findById(new ProjectMemberId(project.getId(), currentUserId))
                .ifPresent(pm -> {
                    if (ObjectUtils.isNotEmpty(pm.getRole())) {
                        response.setCurrentUserRole(pm.getRole().getName());
                    }
                });
    }
}

package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        repository.deleteById(id);
    }
}

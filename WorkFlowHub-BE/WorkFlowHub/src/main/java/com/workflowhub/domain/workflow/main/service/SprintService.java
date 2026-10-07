package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.enums.RoleEnums;
import com.workflowhub.common.exception.ForbiddenException;
import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.common.util.SecurityUtils;
import com.workflowhub.domain.workflow.main.dto.request.CreateSprintRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateSprintRequest;
import com.workflowhub.domain.workflow.main.dto.response.SprintResponse;
import com.workflowhub.domain.workflow.main.entity.SprintEntity;
import com.workflowhub.domain.workflow.main.entity.key.ProjectMemberId;
import com.workflowhub.domain.workflow.main.irepository.IProjectMemberRepository;
import com.workflowhub.domain.workflow.main.irepository.ISprintRepository;
import com.workflowhub.domain.workflow.main.iservice.ISprintService;
import com.workflowhub.domain.workflow.main.mapper.ISprintMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SprintService implements ISprintService {

    private static final RsqlSpecificationBuilder<SprintEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(SprintEntity.class)
                    .field("projectId", "project.id", Long.class)
                    .field("name",      "name",        String.class)
                    .field("status",    "status",      String.class)
                    .field("startDate", "startDate",   java.time.LocalDate.class)
                    .field("endDate",   "endDate",     java.time.LocalDate.class)
                    .build();

    public static final String SPRINT = "Sprint";

    private final ISprintRepository repository;
    private final ISprintMapper mapper;
    private final IProjectMemberRepository projectMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<SprintResponse> getPage(String search, Pageable pageable) {
        Specification<SprintEntity> spec = RSQL_BUILDER.parse(search);
        return repository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SprintResponse getById(Long id) {
        SprintEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(SPRINT, id));
        return mapper.toResponse(entity);
    }

    @Override
    @Transactional
    public SprintResponse create(CreateSprintRequest request) {
        SprintEntity entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public SprintResponse update(Long id, UpdateSprintRequest request) {
        SprintEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(SPRINT, id));

        Long currentUserId = SecurityUtils.getCurrentUserId();
        Long projectId = entity.getProject().getId();
        boolean isPM = projectMemberRepository.findById(new ProjectMemberId(projectId, currentUserId))
                .map(pm -> pm.getRole() != null && RoleEnums.PROJECT_MANAGER.matches(pm.getRole().getName()))
                .orElse(false)
                || (entity.getProject().getOwner() != null && entity.getProject().getOwner().getId().equals(currentUserId));
        if (!isPM) {
            throw new ForbiddenException("Chỉ Project Manager của dự án mới có quyền cập nhật Sprint");
        }

        mapper.updateEntityFromRequest(request, entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of(SPRINT, id);
        }
        repository.deleteById(id);
    }
}

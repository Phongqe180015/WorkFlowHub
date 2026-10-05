package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.domain.workflow.main.dto.request.CreateSprintRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateSprintRequest;
import com.workflowhub.domain.workflow.main.dto.response.SprintResponse;
import com.workflowhub.domain.workflow.main.entity.SprintEntity;
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

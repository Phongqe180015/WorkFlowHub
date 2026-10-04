package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.domain.workflow.main.dto.request.CreateActivityLogRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateActivityLogRequest;
import com.workflowhub.domain.workflow.main.dto.response.ActivityLogResponse;
import com.workflowhub.domain.workflow.main.entity.ActivityLogEntity;
import com.workflowhub.domain.workflow.main.irepository.IActivityLogRepository;
import com.workflowhub.domain.workflow.main.iservice.IActivityLogService;
import com.workflowhub.domain.workflow.main.mapper.IActivityLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActivityLogService implements IActivityLogService {

    private static final RsqlSpecificationBuilder<ActivityLogEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(ActivityLogEntity.class)
                    .field("userId",    "user.id",    Long.class)
                    .field("projectId", "project.id", Long.class)
                    .field("action",    "action",     String.class)
                    .build();

    public static final String ACTIVITY_LOG = "ActivityLog";

    private final IActivityLogRepository repository;
    private final IActivityLogMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityLogResponse> getPage(String search, Pageable pageable) {
        Specification<ActivityLogEntity> spec = RSQL_BUILDER.parse(search);
        return repository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ActivityLogResponse getById(Long id) {
        ActivityLogEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(ACTIVITY_LOG, id));
        return mapper.toResponse(entity);
    }

    @Override
    @Transactional
    public ActivityLogResponse create(CreateActivityLogRequest request) {
        ActivityLogEntity entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public ActivityLogResponse update(Long id, UpdateActivityLogRequest request) {
        ActivityLogEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(ACTIVITY_LOG, id));
        mapper.updateEntityFromRequest(request, entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of(ACTIVITY_LOG, id);
        }
        repository.deleteById(id);
    }
}

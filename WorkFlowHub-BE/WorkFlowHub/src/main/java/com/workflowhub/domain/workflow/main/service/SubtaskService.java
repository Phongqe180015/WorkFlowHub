package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.domain.workflow.main.dto.request.CreateSubtaskRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateSubtaskRequest;
import com.workflowhub.domain.workflow.main.dto.response.SubtaskResponse;
import com.workflowhub.domain.workflow.main.entity.SubtaskEntity;
import com.workflowhub.domain.workflow.main.irepository.ISubtaskRepository;
import com.workflowhub.domain.workflow.main.iservice.ISubtaskService;
import com.workflowhub.domain.workflow.main.mapper.ISubtaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public SubtaskResponse update(Long id, UpdateSubtaskRequest request) {
        SubtaskEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(SUBTASK, id));
        mapper.updateEntityFromRequest(request, entity);
        return mapper.toResponse(repository.save(entity));
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

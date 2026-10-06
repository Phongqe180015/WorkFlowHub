package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.domain.workflow.main.dto.request.CreateTaskRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateTaskRequest;
import com.workflowhub.domain.workflow.main.dto.response.TaskResponse;
import com.workflowhub.domain.workflow.main.entity.TaskEntity;
import com.workflowhub.domain.workflow.main.irepository.ITaskRepository;
import com.workflowhub.domain.workflow.main.iservice.ITaskService;
import com.workflowhub.domain.workflow.main.mapper.ITaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskService implements ITaskService {

    private static final RsqlSpecificationBuilder<TaskEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(TaskEntity.class)
                    .field("projectId",  "project.id",  Long.class)   // ManyToOne dot-path
                    .field("assigneeId", "assignee.id", Long.class)   // ManyToOne dot-path
                    .field("sprintId",   "sprint.id",   Long.class)   // ManyToOne dot-path
                    .build();

    public static final String TASK = "Task";

    private final ITaskRepository repository;
    private final ITaskMapper taskMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getPage(String search, Pageable pageable) {
        Specification<TaskEntity> spec = RSQL_BUILDER.parse(search);
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
        TaskEntity saved = repository.save(entity);
        return taskMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long id, UpdateTaskRequest request) {
        TaskEntity existing = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(TASK, id));
        taskMapper.updateEntityFromRequest(request, existing);
        TaskEntity saved = repository.save(existing);
        return taskMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of(TASK, id);
        }
        repository.deleteById(id);
    }
}

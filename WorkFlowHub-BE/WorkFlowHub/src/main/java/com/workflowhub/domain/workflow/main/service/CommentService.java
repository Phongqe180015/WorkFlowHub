package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.domain.workflow.main.dto.request.CreateCommentRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateCommentRequest;
import com.workflowhub.domain.workflow.main.dto.response.CommentResponse;
import com.workflowhub.domain.workflow.main.entity.CommentEntity;
import com.workflowhub.domain.workflow.main.irepository.ICommentRepository;
import com.workflowhub.domain.workflow.main.iservice.ICommentService;
import com.workflowhub.domain.workflow.main.mapper.ICommentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService implements ICommentService {

    private static final RsqlSpecificationBuilder<CommentEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(CommentEntity.class)
                    .field("taskId", "task.id", Long.class)
                    .field("userId", "user.id", Long.class)
                    .build();

    public static final String COMMENT = "Comment";

    private final ICommentRepository repository;
    private final ICommentMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public Page<CommentResponse> getPage(String search, Pageable pageable) {
        Specification<CommentEntity> spec = RSQL_BUILDER.parse(search);
        return repository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CommentResponse getById(Long id) {
        CommentEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(COMMENT, id));
        return mapper.toResponse(entity);
    }

    @Override
    @Transactional
    public CommentResponse create(CreateCommentRequest request) {
        CommentEntity entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public CommentResponse update(Long id, UpdateCommentRequest request) {
        CommentEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(COMMENT, id));
        mapper.updateEntityFromRequest(request, entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of(COMMENT, id);
        }
        repository.deleteById(id);
    }
}

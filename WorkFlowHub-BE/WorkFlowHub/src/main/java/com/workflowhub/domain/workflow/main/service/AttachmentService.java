package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.domain.workflow.main.dto.request.CreateAttachmentRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateAttachmentRequest;
import com.workflowhub.domain.workflow.main.dto.response.AttachmentResponse;
import com.workflowhub.domain.workflow.main.entity.AttachmentEntity;
import com.workflowhub.domain.workflow.main.irepository.IAttachmentRepository;
import com.workflowhub.domain.workflow.main.iservice.IAttachmentService;
import com.workflowhub.domain.workflow.main.mapper.IAttachmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttachmentService implements IAttachmentService {

    private static final RsqlSpecificationBuilder<AttachmentEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(AttachmentEntity.class)
                    .field("taskId",   "task.id",   Long.class)
                    .field("fileName", "fileName",   String.class)
                    .build();

    public static final String ATTACHMENT = "Attachment";

    private final IAttachmentRepository repository;
    private final IAttachmentMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public Page<AttachmentResponse> getPage(String search, Pageable pageable) {
        Specification<AttachmentEntity> spec = RSQL_BUILDER.parse(search);
        return repository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AttachmentResponse getById(Long id) {
        AttachmentEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(ATTACHMENT, id));
        return mapper.toResponse(entity);
    }

    @Override
    @Transactional
    public AttachmentResponse create(CreateAttachmentRequest request) {
        AttachmentEntity entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public AttachmentResponse update(Long id, UpdateAttachmentRequest request) {
        AttachmentEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(ATTACHMENT, id));
        mapper.updateEntityFromRequest(request, entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of(ATTACHMENT, id);
        }
        repository.deleteById(id);
    }
}

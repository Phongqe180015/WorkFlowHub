package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.domain.workflow.main.dto.request.CreateNotificationRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateNotificationRequest;
import com.workflowhub.domain.workflow.main.dto.response.NotificationResponse;
import com.workflowhub.domain.workflow.main.entity.NotificationEntity;
import com.workflowhub.domain.workflow.main.irepository.INotificationRepository;
import com.workflowhub.domain.workflow.main.iservice.INotificationService;
import com.workflowhub.domain.workflow.main.mapper.INotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {

    private static final RsqlSpecificationBuilder<NotificationEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(NotificationEntity.class)
                    .field("userId", "user.id", Long.class)
                    .field("type",   "type",    String.class)
                    .field("isRead", "isRead",  Boolean.class)
                    .build();

    public static final String NOTIFICATION = "Notification";

    private final INotificationRepository repository;
    private final INotificationMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getPage(String search, Pageable pageable) {
        Specification<NotificationEntity> spec = RSQL_BUILDER.parse(search);
        return repository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getById(Long id) {
        NotificationEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(NOTIFICATION, id));
        return mapper.toResponse(entity);
    }

    @Override
    @Transactional
    public NotificationResponse create(CreateNotificationRequest request) {
        NotificationEntity entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public NotificationResponse update(Long id, UpdateNotificationRequest request) {
        NotificationEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(NOTIFICATION, id));
        mapper.updateEntityFromRequest(request, entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of(NOTIFICATION, id);
        }
        repository.deleteById(id);
    }
}

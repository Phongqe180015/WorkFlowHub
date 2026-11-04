package com.workflowhub.domain.workflow.main.service;

import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.domain.master.irepository.IUsersRepository;
import com.workflowhub.domain.workflow.main.dto.request.CreateCommentRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateCommentRequest;
import com.workflowhub.domain.workflow.main.dto.response.CommentResponse;
import com.workflowhub.domain.workflow.main.entity.CommentEntity;
import com.workflowhub.domain.workflow.main.entity.NotificationEntity;
import com.workflowhub.domain.workflow.main.irepository.ICommentRepository;
import com.workflowhub.domain.workflow.main.irepository.INotificationRepository;
import com.workflowhub.domain.workflow.main.iservice.ICommentService;
import com.workflowhub.domain.workflow.main.mapper.ICommentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService implements ICommentService {

    private static final RsqlSpecificationBuilder<CommentEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(CommentEntity.class)
                    .field("taskId",    "task.id",    Long.class)
                    .field("subtaskId", "subtask.id", Long.class)
                    .field("userId",    "user.id",    Long.class)
                    .build();

    public static final String COMMENT = "Comment";

    private final ICommentRepository repository;
    private final ICommentMapper mapper;
    private final INotificationRepository notificationRepository;
    private final IUsersRepository usersRepository;

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
    @Transactional(readOnly = true)
    public List<CommentResponse> getByTaskId(Long taskId) {
        return repository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream().map(mapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getBySubtaskId(Long subtaskId) {
        return repository.findBySubtaskIdOrderByCreatedAtAsc(subtaskId)
                .stream().map(mapper::toResponse).toList();
    }

    @Override
    @Transactional
    public CommentResponse create(CreateCommentRequest request) {
        UsersEntity user = usersRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CommentEntity entity = mapper.toEntity(request);
        entity.setUser(user);
        CommentEntity saved = repository.save(entity);

        // Send notifications to @mentioned users
        if (request.getMentionedUserIds() != null && !request.getMentionedUserIds().isEmpty()) {
            String commenterName = saved.getUser() != null ? saved.getUser().getName() : "Someone";
            String targetRef = buildTargetRef(request);
            String snippet = truncate(request.getContent(), 80);
            String notifContent = commenterName + " mentioned you in a comment: \"" + snippet + "\" " + targetRef;

            List<NotificationEntity> notifications = new ArrayList<>();
            for (Long mentionedUserId : request.getMentionedUserIds()) {
                // Skip notifying yourself
                if (mentionedUserId.equals(request.getUserId())) continue;
                try {
                    UsersEntity mentionedUser = new UsersEntity();
                    mentionedUser.setId(mentionedUserId);
                    NotificationEntity notif = new NotificationEntity();
                    notif.setUser(mentionedUser);
                    notif.setType("COMMENT_MENTION");
                    notif.setContent(notifContent);
                    notif.setIsRead(false);
                    notifications.add(notif);
                } catch (Exception e) {
                    // Skip if user not found
                }
            }
            if (!notifications.isEmpty()) {
                notificationRepository.saveAll(notifications);
            }
        }

        return mapper.toResponse(saved);
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

    private String buildTargetRef(CreateCommentRequest request) {
        if (request.getSubtaskId() != null) {
            return "(Subtask #" + request.getSubtaskId() + ")";
        } else if (request.getTaskId() != null) {
            return "(Task #" + request.getTaskId() + ")";
        }
        return "";
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() <= maxLen ? text : text.substring(0, maxLen) + "...";
    }
}

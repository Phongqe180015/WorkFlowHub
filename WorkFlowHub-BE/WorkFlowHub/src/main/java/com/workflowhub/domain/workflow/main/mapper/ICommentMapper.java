package com.workflowhub.domain.workflow.main.mapper;

import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.domain.workflow.main.dto.request.CreateCommentRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateCommentRequest;
import com.workflowhub.domain.workflow.main.dto.response.CommentResponse;
import com.workflowhub.domain.workflow.main.entity.CommentEntity;
import com.workflowhub.domain.workflow.main.entity.SubtaskEntity;
import com.workflowhub.domain.workflow.main.entity.TaskEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ICommentMapper {

    @Mapping(target = "task",    expression = "java(taskRef(request.getTaskId()))")
    @Mapping(target = "subtask", expression = "java(subtaskRef(request.getSubtaskId()))")
    CommentEntity toEntity(CreateCommentRequest request);

    @Mapping(target = "taskId",       source = "task.id")
    @Mapping(target = "subtaskId",    source = "subtask.id")
    @Mapping(target = "userId",       source = "user.id")
    @Mapping(target = "userName",     source = "user.name")
    @Mapping(target = "userAvatar",   source = "user.avatar")
    @Mapping(target = "mentionedUserIds", ignore = true)
    CommentResponse toResponse(CommentEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UpdateCommentRequest request, @MappingTarget CommentEntity entity);

    default TaskEntity taskRef(Long id) {
        if (id == null) return null;
        TaskEntity ref = new TaskEntity();
        ref.setId(id);
        return ref;
    }

    default SubtaskEntity subtaskRef(Long id) {
        if (id == null) return null;
        SubtaskEntity ref = new SubtaskEntity();
        ref.setId(id);
        return ref;
    }
}

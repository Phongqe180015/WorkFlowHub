package com.workflowhub.domain.workflow.main.mapper;

import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.domain.workflow.main.dto.request.CreateSubtaskRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateSubtaskRequest;
import com.workflowhub.domain.workflow.main.dto.response.SubtaskResponse;
import com.workflowhub.domain.workflow.main.entity.SubtaskEntity;
import com.workflowhub.domain.workflow.main.entity.TaskEntity;
import org.apache.commons.lang3.ObjectUtils;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ISubtaskMapper {

    @Mapping(target = "task", expression = "java(taskRef(request.getTaskId()))")
    @Mapping(target = "assignee", expression = "java(userRef(request.getAssigneeId()))")
    SubtaskEntity toEntity(CreateSubtaskRequest request);

    @Mapping(target = "taskId", source = "task.id")
    @Mapping(target = "assigneeId", source = "assignee.id")
    @Mapping(target = "assigneeName", source = "assignee.name")
    SubtaskResponse toResponse(SubtaskEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "assignee", expression = "java(request.getAssigneeId() != null ? userRef(request.getAssigneeId()) : entity.getAssignee())")
    void updateEntityFromRequest(UpdateSubtaskRequest request, @MappingTarget SubtaskEntity entity);

    default TaskEntity taskRef(Long id) {
        if (ObjectUtils.isEmpty(id)) return null;
        TaskEntity ref = new TaskEntity();
        ref.setId(id);
        return ref;
    }

    default UsersEntity userRef(Long id) {
        if (ObjectUtils.isEmpty(id)) return null;
        UsersEntity ref = new UsersEntity();
        ref.setId(id);
        return ref;
    }
}

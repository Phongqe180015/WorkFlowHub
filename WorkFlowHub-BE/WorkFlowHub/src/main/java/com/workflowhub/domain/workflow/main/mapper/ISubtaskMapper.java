package com.workflowhub.domain.workflow.main.mapper;

import com.workflowhub.domain.workflow.main.dto.request.CreateSubtaskRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateSubtaskRequest;
import com.workflowhub.domain.workflow.main.dto.response.SubtaskResponse;
import com.workflowhub.domain.workflow.main.entity.SubtaskEntity;
import com.workflowhub.domain.workflow.main.entity.TaskEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ISubtaskMapper {

    @Mapping(target = "task", expression = "java(taskRef(request.getTaskId()))")
    SubtaskEntity toEntity(CreateSubtaskRequest request);

    @Mapping(target = "taskId", source = "task.id")
    SubtaskResponse toResponse(SubtaskEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UpdateSubtaskRequest request, @MappingTarget SubtaskEntity entity);

    default TaskEntity taskRef(Long id) {
        if (id == null) return null;
        TaskEntity ref = new TaskEntity();
        ref.setId(id);
        return ref;
    }
}

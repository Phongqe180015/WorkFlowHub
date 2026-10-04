package com.workflowhub.domain.workflow.main.mapper;

import com.workflowhub.domain.workflow.main.dto.request.CreateAttachmentRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateAttachmentRequest;
import com.workflowhub.domain.workflow.main.dto.response.AttachmentResponse;
import com.workflowhub.domain.workflow.main.entity.AttachmentEntity;
import com.workflowhub.domain.workflow.main.entity.TaskEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface IAttachmentMapper {

    @Mapping(target = "task", expression = "java(taskRef(request.getTaskId()))")
    AttachmentEntity toEntity(CreateAttachmentRequest request);

    @Mapping(target = "taskId", source = "task.id")
    AttachmentResponse toResponse(AttachmentEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UpdateAttachmentRequest request, @MappingTarget AttachmentEntity entity);

    default TaskEntity taskRef(Long id) {
        if (id == null) return null;
        TaskEntity ref = new TaskEntity();
        ref.setId(id);
        return ref;
    }
}

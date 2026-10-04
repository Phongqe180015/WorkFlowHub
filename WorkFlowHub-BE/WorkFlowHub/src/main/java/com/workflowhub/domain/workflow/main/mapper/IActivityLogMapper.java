package com.workflowhub.domain.workflow.main.mapper;

import com.workflowhub.domain.master.entity.ProjectEntity;
import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.domain.workflow.main.dto.request.CreateActivityLogRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateActivityLogRequest;
import com.workflowhub.domain.workflow.main.dto.response.ActivityLogResponse;
import com.workflowhub.domain.workflow.main.entity.ActivityLogEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface IActivityLogMapper {

    @Mapping(target = "user",    expression = "java(userRef(request.getUserId()))")
    @Mapping(target = "project", expression = "java(projectRef(request.getProjectId()))")
    ActivityLogEntity toEntity(CreateActivityLogRequest request);

    @Mapping(target = "userId",      source = "user.id")
    @Mapping(target = "userName",    source = "user.name")
    @Mapping(target = "projectId",   source = "project.id")
    @Mapping(target = "projectName", source = "project.name")
    ActivityLogResponse toResponse(ActivityLogEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UpdateActivityLogRequest request, @MappingTarget ActivityLogEntity entity);

    default UsersEntity userRef(Long id) {
        if (id == null) return null;
        UsersEntity ref = new UsersEntity();
        ref.setId(id);
        return ref;
    }

    default ProjectEntity projectRef(Long id) {
        if (id == null) return null;
        ProjectEntity ref = new ProjectEntity();
        ref.setId(id);
        return ref;
    }
}

package com.workflowhub.domain.workflow.main.mapper;

import com.workflowhub.domain.master.entity.ProjectEntity;
import com.workflowhub.domain.workflow.main.dto.request.CreateSprintRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateSprintRequest;
import com.workflowhub.domain.workflow.main.dto.response.SprintResponse;
import com.workflowhub.domain.workflow.main.entity.SprintEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ISprintMapper {

    @Mapping(target = "project", expression = "java(projectRef(request.getProjectId()))")
    SprintEntity toEntity(CreateSprintRequest request);

    @Mapping(target = "projectId",   source = "project.id")
    @Mapping(target = "projectName", source = "project.name")
    SprintResponse toResponse(SprintEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "project", expression = "java(request.getProjectId() != null ? projectRef(request.getProjectId()) : entity.getProject())")
    void updateEntityFromRequest(UpdateSprintRequest request, @MappingTarget SprintEntity entity);

    default ProjectEntity projectRef(Long id) {
        if (id == null) return null;
        ProjectEntity ref = new ProjectEntity();
        ref.setId(id);
        return ref;
    }
}

package com.workflowhub.domain.workflow.main.mapper;

import com.workflowhub.domain.master.entity.ProjectEntity;
import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.domain.workflow.main.dto.request.CreateProjectMemberRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateProjectMemberRequest;
import com.workflowhub.domain.workflow.main.dto.response.ProjectMemberResponse;
import com.workflowhub.domain.workflow.main.entity.ProjectMemberEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface IProjectMemberMapper {

    @Mapping(target = "id",      expression = "java(new com.workflowhub.domain.workflow.main.entity.key.ProjectMemberId(request.getProjectId(), request.getUserId()))")
    @Mapping(target = "project", expression = "java(projectRef(request.getProjectId()))")
    @Mapping(target = "user",    expression = "java(userRef(request.getUserId()))")
    ProjectMemberEntity toEntity(CreateProjectMemberRequest request);

    @Mapping(target = "projectId",   source = "project.id")
    @Mapping(target = "projectName", source = "project.name")
    @Mapping(target = "userId",      source = "user.id")
    @Mapping(target = "userName",    source = "user.name")
    ProjectMemberResponse toResponse(ProjectMemberEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UpdateProjectMemberRequest request, @MappingTarget ProjectMemberEntity entity);

    default ProjectEntity projectRef(Long id) {
        if (id == null) return null;
        ProjectEntity ref = new ProjectEntity();
        ref.setId(id);
        return ref;
    }

    default UsersEntity userRef(Long id) {
        if (id == null) return null;
        UsersEntity ref = new UsersEntity();
        ref.setId(id);
        return ref;
    }
}

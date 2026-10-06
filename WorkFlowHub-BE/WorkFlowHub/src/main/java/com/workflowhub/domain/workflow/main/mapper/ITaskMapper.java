package com.workflowhub.domain.workflow.main.mapper;

import com.workflowhub.domain.master.entity.ProjectEntity;
import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.domain.workflow.main.dto.request.CreateTaskRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateTaskRequest;
import com.workflowhub.domain.workflow.main.dto.response.TaskResponse;
import com.workflowhub.domain.workflow.main.entity.SprintEntity;
import com.workflowhub.domain.workflow.main.entity.TaskEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ITaskMapper {

    /**
     * CreateTaskRequest → TaskEntity
     * Long projectId/assigneeId/sprintId → entity reference proxy
     */
    @Mapping(target = "project",  expression = "java(projectRef(request.getProjectId()))")
    @Mapping(target = "assignee", expression = "java(userRef(request.getAssigneeId()))")
    @Mapping(target = "sprint",   expression = "java(sprintRef(request.getSprintId()))")
    TaskEntity toEntity(CreateTaskRequest request);

    /**
     * TaskEntity → TaskResponse
     * Flatten entity FK to id + name
     */
    @Mapping(target = "projectId",    source = "project.id")
    @Mapping(target = "projectName",  source = "project.name")
    @Mapping(target = "assigneeId",   source = "assignee.id")
    @Mapping(target = "assigneeName", source = "assignee.name")
    @Mapping(target = "sprintId",     source = "sprint.id")
    @Mapping(target = "sprintName",   source = "sprint.name")
    TaskResponse toResponse(TaskEntity entity);

    /**
     * Partial update — chỉ cập nhật các field không null
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "project",  expression = "java(request.getProjectId()  != null ? projectRef(request.getProjectId())  : entity.getProject())")
    @Mapping(target = "assignee", expression = "java(request.getAssigneeId() != null ? userRef(request.getAssigneeId())    : entity.getAssignee())")
    @Mapping(target = "sprint",   expression = "java(request.getSprintId()   != null ? sprintRef(request.getSprintId())    : entity.getSprint())")
    void updateEntityFromRequest(UpdateTaskRequest request, @MappingTarget TaskEntity entity);

    // -----------------------------------------------------------------------
    // Reference proxy helpers (không load toàn bộ entity từ DB)
    // -----------------------------------------------------------------------

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

    default SprintEntity sprintRef(Long id) {
        if (id == null) return null;
        SprintEntity ref = new SprintEntity();
        ref.setId(id);
        return ref;
    }
}

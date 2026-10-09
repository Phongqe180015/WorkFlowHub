package com.workflowhub.domain.master.mapper;

import com.workflowhub.domain.master.dto.request.CreateProjectRequest;
import com.workflowhub.domain.master.dto.request.UpdateProjectRequest;
import com.workflowhub.domain.master.dto.response.ProjectResponse;
import com.workflowhub.domain.master.entity.ProjectEntity;
import com.workflowhub.domain.master.entity.UsersEntity;
import org.apache.commons.lang3.ObjectUtils;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface IProjectMapper {

    @Mapping(target = "owner", expression = "java(ownerRef(request.getOwnerId()))")
    ProjectEntity toEntity(CreateProjectRequest request);

    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "ownerName", source = "owner.name")
    ProjectResponse toResponse(ProjectEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "owner", expression = "java(request.getOwnerId() != null ? ownerRef(request.getOwnerId()) : entity.getOwner())")
    void updateEntityFromRequest(UpdateProjectRequest request, @MappingTarget ProjectEntity entity);

    default UsersEntity ownerRef(Long ownerId) {
        if (ObjectUtils.isEmpty(ownerId)) return null;
        UsersEntity ref = new UsersEntity();
        ref.setId(ownerId);
        return ref;
    }
}

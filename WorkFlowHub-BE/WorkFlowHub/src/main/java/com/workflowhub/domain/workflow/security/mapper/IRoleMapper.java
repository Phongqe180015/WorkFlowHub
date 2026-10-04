package com.workflowhub.domain.workflow.security.mapper;

import com.workflowhub.domain.workflow.security.dto.request.CreateRoleRequest;
import com.workflowhub.domain.workflow.security.dto.request.UpdateRoleRequest;
import com.workflowhub.domain.workflow.security.dto.response.RoleResponse;
import com.workflowhub.domain.workflow.security.entity.RoleEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface IRoleMapper {

    RoleEntity toEntity(CreateRoleRequest request);

    RoleResponse toResponse(RoleEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UpdateRoleRequest request, @MappingTarget RoleEntity entity);
}

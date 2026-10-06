package com.workflowhub.domain.master.mapper;

import com.workflowhub.domain.master.dto.request.CreateUserRequest;
import com.workflowhub.domain.master.dto.request.UpdateUserRequest;
import com.workflowhub.domain.master.dto.response.UserResponse;
import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.domain.workflow.security.entity.RoleEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface IUsersMapper {

    @Mapping(target = "role", expression = "java(roleRef(roleId))")
    UsersEntity toEntity(CreateUserRequest request, Long roleId);

    @Mapping(target = "roleId", source = "role.id")
    @Mapping(target = "roleName", source = "role.name")
    UserResponse toResponse(UsersEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "role", expression = "java(request.getRoleId() != null ? roleRef(request.getRoleId()) : entity.getRole())")
    void updateEntityFromRequest(UpdateUserRequest request, @MappingTarget UsersEntity entity);

    default RoleEntity roleRef(Long id) {
        if (id == null) return null;
        RoleEntity ref = new RoleEntity();
        ref.setId(id);
        return ref;
    }
}


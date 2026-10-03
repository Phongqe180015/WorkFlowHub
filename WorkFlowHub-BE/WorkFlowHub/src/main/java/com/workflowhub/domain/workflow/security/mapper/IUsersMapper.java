package com.workflowhub.domain.workflow.security.mapper;

import com.workflowhub.domain.workflow.security.dto.request.CreateUserRequest;
import com.workflowhub.domain.workflow.security.dto.request.UpdateUserRequest;
import com.workflowhub.domain.workflow.security.dto.response.UserResponse;
import com.workflowhub.domain.workflow.security.entity.UsersEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;


@Mapper(componentModel = "spring")
public interface IUsersMapper {

    UsersEntity toEntity(CreateUserRequest request);

    UserResponse toResponse(UsersEntity entity);

    void updateEntityFromRequest(UpdateUserRequest request, @MappingTarget UsersEntity entity);
}

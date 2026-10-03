package com.workflowhub.domain.master.mapper;

import com.workflowhub.domain.master.dto.request.CreateUserRequest;
import com.workflowhub.domain.master.dto.request.UpdateUserRequest;
import com.workflowhub.domain.master.dto.response.UserResponse;
import com.workflowhub.domain.master.entity.UsersEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface IUsersMapper {

    UsersEntity toEntity(CreateUserRequest request);

    UserResponse toResponse(UsersEntity entity);

    void updateEntityFromRequest(UpdateUserRequest request, @MappingTarget UsersEntity entity);
}

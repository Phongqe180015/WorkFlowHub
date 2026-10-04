package com.workflowhub.domain.workflow.main.mapper;

import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.domain.workflow.main.dto.request.CreateNotificationRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateNotificationRequest;
import com.workflowhub.domain.workflow.main.dto.response.NotificationResponse;
import com.workflowhub.domain.workflow.main.entity.NotificationEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface INotificationMapper {

    @Mapping(target = "user", expression = "java(userRef(request.getUserId()))")
    NotificationEntity toEntity(CreateNotificationRequest request);

    @Mapping(target = "userId",   source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    NotificationResponse toResponse(NotificationEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UpdateNotificationRequest request, @MappingTarget NotificationEntity entity);

    default UsersEntity userRef(Long id) {
        if (id == null) return null;
        UsersEntity ref = new UsersEntity();
        ref.setId(id);
        return ref;
    }
}

package com.workflowhub.domain.workflow.main.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.workflow.main.entity.NotificationEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface INotificationRepository extends BaseRepository<NotificationEntity, Long> {
}

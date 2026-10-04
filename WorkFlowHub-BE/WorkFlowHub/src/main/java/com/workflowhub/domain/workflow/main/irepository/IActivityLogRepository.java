package com.workflowhub.domain.workflow.main.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.workflow.main.entity.ActivityLogEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface IActivityLogRepository extends BaseRepository<ActivityLogEntity, Long> {
}

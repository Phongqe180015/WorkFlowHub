package com.workflowhub.domain.workflow.main.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.workflow.main.entity.TaskEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface ITaskRepository extends BaseRepository<TaskEntity, Long> {
}

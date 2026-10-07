package com.workflowhub.domain.workflow.main.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.workflow.main.entity.SubtaskEntity;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ISubtaskRepository extends BaseRepository<SubtaskEntity, Long> {
    List<SubtaskEntity> findByTaskId(Long taskId);
}

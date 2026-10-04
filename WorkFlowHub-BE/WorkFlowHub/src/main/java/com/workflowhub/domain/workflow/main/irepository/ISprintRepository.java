package com.workflowhub.domain.workflow.main.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.workflow.main.entity.SprintEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface ISprintRepository extends BaseRepository<SprintEntity, Long> {
}

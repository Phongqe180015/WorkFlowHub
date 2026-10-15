package com.workflowhub.domain.workflow.main.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.workflow.main.entity.SprintEntity;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ISprintRepository extends BaseRepository<SprintEntity, Long> {
    Optional<SprintEntity> findFirstByProjectIdAndStatusIgnoreCase(Long projectId, String status);
}

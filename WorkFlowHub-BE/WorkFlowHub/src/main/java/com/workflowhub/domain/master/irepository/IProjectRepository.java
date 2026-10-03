package com.workflowhub.domain.master.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.master.entity.ProjectEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface IProjectRepository extends BaseRepository<ProjectEntity, Long> {
}

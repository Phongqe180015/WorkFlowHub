package com.workflowhub.domain.master.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.master.entity.ProjectEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IProjectRepository extends BaseRepository<ProjectEntity, Long> {

    @Query("""
        SELECT DISTINCT p FROM ProjectEntity p
                WHERE p.owner.id = :userId
                   OR p.id IN (
                       SELECT pm.id.projectId FROM ProjectMemberEntity pm
                       WHERE pm.id.userId = :userId
                   )
    """)
    Page<ProjectEntity> findProjectsByUserId(@Param("userId") Long currentUserId, Pageable pageable);
}

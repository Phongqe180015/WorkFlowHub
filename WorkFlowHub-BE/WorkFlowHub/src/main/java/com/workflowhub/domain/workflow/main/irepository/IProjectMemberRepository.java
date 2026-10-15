package com.workflowhub.domain.workflow.main.irepository;

import com.workflowhub.domain.workflow.main.entity.ProjectMemberEntity;
import com.workflowhub.domain.workflow.main.entity.key.ProjectMemberId;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface IProjectMemberRepository extends JpaRepository<ProjectMemberEntity, ProjectMemberId>, JpaSpecificationExecutor<ProjectMemberEntity> {

    @Query("SELECT COUNT(pm) FROM ProjectMemberEntity pm WHERE pm.user.id = :userId")
    long countProjectsByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(pm) FROM ProjectMemberEntity pm WHERE pm.project.id = :projectId")
    long countMembersByProjectId(@Param("projectId") Long projectId);
}

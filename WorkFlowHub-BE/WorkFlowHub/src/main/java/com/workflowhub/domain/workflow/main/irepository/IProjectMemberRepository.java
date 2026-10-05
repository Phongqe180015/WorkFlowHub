package com.workflowhub.domain.workflow.main.irepository;

import com.workflowhub.domain.workflow.main.entity.ProjectMemberEntity;
import com.workflowhub.domain.workflow.main.entity.key.ProjectMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface IProjectMemberRepository extends JpaRepository<ProjectMemberEntity, ProjectMemberId>, JpaSpecificationExecutor<ProjectMemberEntity> {
}

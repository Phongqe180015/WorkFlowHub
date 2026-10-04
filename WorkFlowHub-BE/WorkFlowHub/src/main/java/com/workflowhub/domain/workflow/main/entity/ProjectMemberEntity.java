package com.workflowhub.domain.workflow.main.entity;

import com.workflowhub.common.entity.BaseEntity;
import com.workflowhub.domain.master.entity.ProjectEntity;
import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.domain.workflow.main.entity.key.ProjectMemberId;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "project_members", schema = "workflow")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberEntity extends BaseEntity {

    @EmbeddedId
    private ProjectMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("projectId")
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectEntity project;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private UsersEntity user;

    @Column(name = "role", length = 100)
    private String role;
}

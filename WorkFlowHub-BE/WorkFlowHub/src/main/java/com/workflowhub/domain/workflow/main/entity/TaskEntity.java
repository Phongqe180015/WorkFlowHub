package com.workflowhub.domain.workflow.main.entity;

import com.workflowhub.common.entity.BaseEntity;
import com.workflowhub.domain.master.entity.ProjectEntity;
import com.workflowhub.domain.master.entity.UsersEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "tasks", schema = "workflow")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectEntity project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", nullable = true)
    private SprintEntity sprint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id", nullable = true)
    private UsersEntity assignee;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "priority", length = 50)
    private String priority;

    @Column(name = "status", length = 50)
    private String status = "pending";

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "task_code", length = 50)
    private String taskCode;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
}

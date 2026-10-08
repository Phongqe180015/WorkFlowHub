package com.workflowhub.domain.workflow.main.entity;

import com.workflowhub.common.entity.BaseEntity;
import com.workflowhub.domain.master.entity.UsersEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "subtasks", schema = "workflow")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubtaskEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private TaskEntity task;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", length = 400)
    private String description;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private UsersEntity assignee;

    @Column(name = "estimate", length = 50)
    private String estimate;

    @Column(name = "priority", length = 50)
    private String priority;

    @Column(name = "due_date")
    private LocalDate dueDate;
}

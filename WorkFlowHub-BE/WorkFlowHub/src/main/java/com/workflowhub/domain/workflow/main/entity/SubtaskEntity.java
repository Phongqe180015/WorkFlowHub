package com.workflowhub.domain.workflow.main.entity;

import com.workflowhub.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
}

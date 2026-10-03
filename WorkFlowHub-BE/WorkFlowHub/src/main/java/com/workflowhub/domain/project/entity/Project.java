package com.workflowhub.domain.project.entity;

import com.workflowhub.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Example entity demonstrating how a business module extends {@link BaseEntity}.
 *
 * <p>This class demonstrates the pattern only — it is NOT a complete implementation.
 * A real {@code Project} entity would have additional fields, relationships,
 * and business constraints.</p>
 *
 * <h3>What BaseEntity provides for free:</h3>
 * <ul>
 *   <li>{@code id} — auto-generated UUID primary key</li>
 *   <li>{@code createdAt} — set automatically on first persist</li>
 *   <li>{@code updatedAt} — updated automatically on every merge</li>
 *   <li>{@code version} — optimistic locking</li>
 *   <li>{@code equals}/{@code hashCode} — identity-based on id</li>
 * </ul>
 */
@Entity
@Table(name = "projects")
@Getter
@Setter
public class Project extends BaseEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ProjectStatus status = ProjectStatus.ACTIVE;
    @Id
    private Long id;


    public enum ProjectStatus {
        ACTIVE, ARCHIVED, DELETED
    }
}

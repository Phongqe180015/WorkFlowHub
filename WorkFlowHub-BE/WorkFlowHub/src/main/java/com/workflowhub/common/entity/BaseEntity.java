package com.workflowhub.common.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Base class for all JPA entities in WorkFlowHub.
 *
 * <h3>Design decisions:</h3>
 * <ul>
 *   <li><b>UUID PK</b>: {@code GenerationType.UUID} was introduced in Hibernate 6 (shipped with
 *       Spring Boot 3+). It generates a random UUID at the Java level before the INSERT,
 *       which means the entity already has an ID before being persisted — useful for event
 *       sourcing, distributed IDs, and testing without a DB round-trip.</li>
 *   <li><b>Auditing</b>: {@code @EntityListeners(AuditingEntityListener.class)} delegates
 *       to Spring Data JPA auditing, which requires {@code @EnableJpaAuditing} in a
 *       {@code @Configuration} class.</li>
 *   <li><b>Optimistic locking</b>: {@code @Version} prevents lost-update anomalies
 *       in concurrent writes. Hibernate automatically increments the version on each UPDATE
 *       and throws {@code OptimisticLockException} on conflict.</li>
 *   <li><b>No {@code @Table}</b>: table name is set by the concrete entity subclass.</li>
 *   <li><b>{@code equals}/{@code hashCode}</b>: based solely on {@code id} so that
 *       entities placed in collections behave correctly before and after persistence.</li>
 * </ul>
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class BaseEntity {

    /**
     * Timestamp of when this entity was first persisted (UTC).
     * Set automatically by JPA auditing; never updated afterward.
     */
    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp of the most recent update (UTC).
     * Automatically updated by JPA auditing on every {@code MERGE} / {@code UPDATE}.
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}

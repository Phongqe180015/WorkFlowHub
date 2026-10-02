package com.workflowhub.common.repository;

import com.workflowhub.common.entity.BaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

/**
 * Base repository interface for all WorkFlowHub repositories.
 *
 * <h3>Why {@link JpaSpecificationExecutor}?</h3>
 * <p>{@code JpaSpecificationExecutor} enables querying via the Criteria API through
 * type-safe {@link org.springframework.data.jpa.domain.Specification} objects.
 * This is the backbone of the RSQL filtering layer: RSQL expressions are parsed
 * into a {@code Specification<T>}, then passed directly to the repository's
 * {@code findAll(Specification, Pageable)} method — without any custom query methods.</p>
 *
 * <h3>Why {@code @NoRepositoryBean}?</h3>
 * <p>Prevents Spring Data from trying to instantiate this interface as a concrete
 * repository bean. Only concrete subinterfaces (e.g., {@code ProjectRepository})
 * become Spring beans.</p>
 *
 * @param <T>  the entity type, must extend {@link BaseEntity}
 * @param <ID> the primary key type (typically {@link java.util.UUID})
 */
@NoRepositoryBean
public interface BaseRepository<T extends BaseEntity, ID>
        extends JpaRepository<T, ID>, JpaSpecificationExecutor<T> {
}

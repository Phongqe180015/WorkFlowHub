package com.workflowhub.common.service;

import com.workflowhub.common.entity.BaseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

/**
 * Generic service contract for standard CRUD operations.
 *
 * <h3>Why is {@code update()} abstract?</h3>
 * <p>A generic {@code update(ID id, T entity)} cannot be safely implemented
 * in a base class. Options and their trade-offs:</p>
 * <ul>
 *   <li><b>Full-replace</b>: replacing all fields would overwrite audit fields, version,
 *       and fields not present in the update request — which is almost never correct.</li>
 *   <li><b>Reflection-based patch</b>: fragile, breaks encapsulation, hard to test,
 *       and can silently ignore validation.</li>
 * </ul>
 * <p>The correct approach is to implement update logic in each concrete service class
 * where the developer knows exactly which fields should be updated and how.
 * This interface declares {@code update()} so the contract is visible in the type
 * hierarchy, but the implementation is intentionally deferred to subclasses.</p>
 *
 * @param <T>  the entity type
 * @param <ID> the primary key type
 */
public interface BaseService<T extends BaseEntity, ID> {

    /**
     * Finds an entity by its primary key.
     *
     * @param id the primary key
     * @return the entity
     * @throws com.workflowhub.common.exception.NotFoundException if not found
     */
    T findById(ID id);

    /**
     * Returns all entities (no pagination). Use with caution on large tables.
     */
    List<T> findAll();

    /**
     * Returns a page of entities.
     *
     * @param pageable pagination and sort configuration
     */
    Page<T> findAll(Pageable pageable);

    /**
     * Returns a page of entities matching the given specification.
     *
     * <p>This is the primary entry point for RSQL-filtered queries:</p>
     * <pre>{@code
     * Specification<T> spec = rsqlSpecificationBuilder.parse(search, T.class);
     * Page<T> page = service.findAll(spec, pageable);
     * }</pre>
     *
     * @param spec     the JPA Specification (may be null to return all)
     * @param pageable pagination and sort configuration
     */
    Page<T> findAll(Specification<T> spec, Pageable pageable);

    /**
     * Persists a new entity.
     *
     * @param entity the entity to save
     * @return the saved entity (with generated ID and audit timestamps)
     */
    T save(T entity);

    /**
     * Updates an existing entity.
     *
     * <p>Concrete implementations must define which fields are updated and
     * how the merge is performed. The {@link BaseServiceImpl} leaves this
     * abstract on purpose.</p>
     *
     * @param id     the primary key of the entity to update
     * @param entity the entity carrying the updated values
     * @return the updated entity
     */
    T update(ID id, T entity);

    /**
     * Deletes an entity by its primary key.
     *
     * @param id the primary key
     * @throws com.workflowhub.common.exception.NotFoundException if not found
     */
    void deleteById(ID id);

    /**
     * Returns {@code true} if an entity with the given ID exists.
     *
     * @param id the primary key to check
     */
    boolean existsById(ID id);
}

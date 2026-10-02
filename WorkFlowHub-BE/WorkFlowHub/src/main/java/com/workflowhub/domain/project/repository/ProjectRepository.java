package com.workflowhub.domain.project.repository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.project.entity.Project;

import java.util.UUID;

/**
 * Repository for {@link Project} entities.
 *
 * <p>By extending {@link BaseRepository}, this interface gets for free:</p>
 * <ul>
 *   <li>Full CRUD: {@code save}, {@code findById}, {@code delete}, etc.</li>
 *   <li>Pagination: {@code findAll(Pageable)}</li>
 *   <li>Sorting: {@code findAll(Sort)}</li>
 *   <li>Specification queries: {@code findAll(Specification, Pageable)} — used by RSQL</li>
 * </ul>
 *
 * <p>Add custom query methods here only when Specifications cannot express the query.</p>
 */
public interface ProjectRepository extends BaseRepository<Project, UUID> {

    // Example custom query (only add if Specification cannot cover it):
    // Optional<Project> findByName(String name);
}

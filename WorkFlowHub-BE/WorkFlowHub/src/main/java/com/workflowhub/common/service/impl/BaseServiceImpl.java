package com.workflowhub.common.service.impl;

import com.workflowhub.common.entity.BaseEntity;
import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.common.service.BaseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Abstract base implementation of {@link BaseService}.
 *
 * <h3>Transaction strategy:</h3>
 * <ul>
 *   <li>Read operations: {@code @Transactional(readOnly = true)} — hints Hibernate
 *       to skip dirty-checking, reducing memory and CPU overhead.</li>
 *   <li>Write operations: {@code @Transactional} — ensures atomicity.</li>
 * </ul>
 *
 * <h3>How to extend:</h3>
 * <pre>{@code
 * @Service
 * public class ProjectServiceImpl
 *         extends BaseServiceImpl<Project, UUID, ProjectRepository>
 *         implements ProjectService {
 *
 *     public ProjectServiceImpl(ProjectRepository repository) {
 *         super(repository, "Project");
 *     }
 *
 *     @Override
 *     public Project update(UUID id, Project incoming) {
 *         Project existing = findById(id);
 *         existing.setName(incoming.getName());
 *         existing.setDescription(incoming.getDescription());
 *         return repository.save(existing);
 *     }
 * }
 * }</pre>
 *
 * @param <T>  entity type
 * @param <ID> primary key type
 * @param <R>  repository type
 */
@Slf4j
@Transactional
public abstract class BaseServiceImpl<
        T extends BaseEntity,
        ID,
        R extends BaseRepository<T, ID>>
        implements BaseService<T, ID> {

    /** The concrete repository instance injected by the subclass constructor. */
    protected final R repository;

    /**
     * Human-readable name of the entity, used in error messages.
     * Example: {@code "Project"}, {@code "Task"}.
     */
    private final String entityName;

    protected BaseServiceImpl(R repository, String entityName) {
        this.repository = repository;
        this.entityName = entityName;
    }

    // -----------------------------------------------------------------------
    // Read operations (readOnly = true)
    // -----------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public T findById(ID id) {
        log.debug("Finding {} by id: {}", entityName, id);
        return repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(entityName, id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<T> findAll() {
        log.debug("Finding all {}", entityName);
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<T> findAll(Pageable pageable) {
        log.debug("Finding {} page: {}", entityName, pageable);
        return repository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<T> findAll(Specification<T> spec, Pageable pageable) {
        log.debug("Finding {} with spec, page: {}", entityName, pageable);
        return repository.findAll(spec, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(ID id) {
        return repository.existsById(id);
    }

    // -----------------------------------------------------------------------
    // Write operations
    // -----------------------------------------------------------------------

    @Override
    public T save(T entity) {
        log.debug("Saving {}", entityName);
        return repository.save(entity);
    }

    @Override
    public void deleteById(ID id) {
        log.debug("Deleting {} by id: {}", entityName, id);
        if (!repository.existsById(id)) {
            throw NotFoundException.of(entityName, id);
        }
        repository.deleteById(id);
    }

}

package com.workflowhub.common.rsql;

import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.entity.BaseEntity;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.Nullable;

/**
 * Convenience utilities for combining RSQL specifications with pagination.
 *
 * <p>These static helpers keep controller code concise by combining the common
 * patterns of building a Specification and a Pageable into single method calls.</p>
 *
 * <h3>Typical controller usage:</h3>
 * <pre>{@code
 * @GetMapping
 * public ResponseEntity<?> list(
 *         @RequestParam(required = false) String search,
 *         @RequestParam(defaultValue = "0") int page,
 *         @RequestParam(defaultValue = "20") int size,
 *         @RequestParam(defaultValue = "createdAt") String sortBy,
 *         @RequestParam(defaultValue = "DESC") String sortDirection) {
 *
 *     Specification<Task> spec = rsqlBuilder.parse(search, Task.class);
 *     Pageable pageable = RsqlUtils.pageable(page, size, sortBy, sortDirection);
 *     Page<Task> result = taskService.findAll(spec, pageable);
 *     return page(result.map(mapper::toResponse));
 * }
 * }</pre>
 */
public final class RsqlUtils {

    private RsqlUtils() {}

    /**
     * Builds a Spring {@link Pageable} from primitive page parameters.
     *
     * @param page          zero-based page index
     * @param size          number of items per page (clamped to {@link AppConstants#MAX_PAGE_SIZE})
     * @param sortBy        field name to sort by
     * @param sortDirection "ASC" or "DESC" (case-insensitive); defaults to DESC on invalid input
     */
    public static Pageable pageable(int page, int size, String sortBy, String sortDirection) {
        int clampedSize = Math.min(size, AppConstants.MAX_PAGE_SIZE);
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(sortDirection);
        } catch (IllegalArgumentException e) {
            direction = Sort.Direction.DESC;
        }
        return PageRequest.of(page, clampedSize, Sort.by(direction, sortBy));
    }

    /**
     * Builds a default {@link Pageable} using application defaults.
     */
    public static Pageable defaultPageable() {
        return PageRequest.of(
                AppConstants.DEFAULT_PAGE,
                AppConstants.DEFAULT_PAGE_SIZE,
                Sort.by(Sort.Direction.DESC, AppConstants.DEFAULT_SORT_FIELD)
        );
    }

    /**
     * Returns the given specification, or an unrestricted specification if null.
     *
     * <p>Use this when passing a potentially-null spec to a repository method that
     * does not accept null:</p>
     * <pre>{@code
     * Specification<Task> spec = RsqlUtils.orAll(rsqlBuilder.parse(search, Task.class));
     * }</pre>
     *
     * @param spec a nullable {@link Specification}
     * @param <T>  the entity type
     * @return the original spec, or {@link Specification#where(Specification)} for null
     */
    public static <T extends BaseEntity> Specification<T> orAll(@Nullable Specification<T> spec) {
        return spec != null ? spec : Specification.where(null);
    }
}

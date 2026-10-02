package com.workflowhub.common.dto.request;

import com.workflowhub.common.constant.AppConstants;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Reusable base class for paginated API requests.
 *
 * <p>Controllers should accept a {@code BasePageRequest} (or a subclass) as a
 * {@code @ModelAttribute} to bind {@code page}, {@code size}, and {@code sort} from
 * query parameters automatically.</p>
 *
 * <h3>Usage example:</h3>
 * <pre>{@code
 * GET /api/v1/projects?page=0&size=20&sortBy=createdAt&sortDirection=DESC
 * }</pre>
 */
@Getter
@Setter
public class BasePageRequest {

    /** Zero-based page index. */
    @Min(value = 0, message = "Page index must be >= 0")
    private int page = AppConstants.DEFAULT_PAGE;

    /** Number of items per page. */
    @Min(value = 1, message = "Page size must be >= 1")
    @Max(value = AppConstants.MAX_PAGE_SIZE, message = "Page size must be <= " + AppConstants.MAX_PAGE_SIZE)
    private int size = AppConstants.DEFAULT_PAGE_SIZE;

    /** Field to sort by. Defaults to {@code createdAt}. */
    private String sortBy = AppConstants.DEFAULT_SORT_FIELD;

    /** Sort direction string; accepted values: {@code ASC}, {@code DESC}. */
    private String sortDirection = "DESC";

    /**
     * Converts this request into a Spring Data {@link Pageable}.
     *
     * @return a configured {@code Pageable}
     */
    public Pageable toPageable() {
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(sortDirection);
        } catch (IllegalArgumentException e) {
            direction = Sort.Direction.DESC;
        }
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }
}

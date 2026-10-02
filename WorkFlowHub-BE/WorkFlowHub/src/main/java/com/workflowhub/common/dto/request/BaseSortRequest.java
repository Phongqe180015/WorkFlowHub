package com.workflowhub.common.dto.request;

import com.workflowhub.common.enums.SortDirection;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

/**
 * Standalone sort request for use cases where pagination is not needed
 * but sort configuration is desired.
 *
 * <p>Can be embedded in larger request objects:</p>
 * <pre>{@code
 * public class FindTasksRequest extends BasePageRequest {
 *     // BasePageRequest already has sortBy + sortDirection
 * }
 * }</pre>
 *
 * <p>Or used independently when requesting a full list with a specific sort order.</p>
 */
@Getter
@Setter
public class BaseSortRequest {

    /** Field to sort by. */
    private String sortBy = "createdAt";

    /** Sort direction. Defaults to {@code DESC} (newest first). */
    private SortDirection sortDirection = SortDirection.DESC;

    /**
     * Converts this sort request to a Spring Data {@link Sort}.
     *
     * @return a configured {@code Sort}
     */
    public Sort toSort() {
        return Sort.by(sortDirection.toSortDirection(), sortBy);
    }
}

package com.workflowhub.common.enums;

import org.springframework.data.domain.Sort;

/**
 * Sort direction enum used in request DTOs.
 *
 * <p>Wraps {@link Sort.Direction} so API-facing objects remain decoupled
 * from Spring's persistence layer classes.</p>
 */
public enum SortDirection {

    ASC,
    DESC;

    /**
     * Converts this enum constant to the corresponding Spring {@link Sort.Direction}.
     *
     * @return {@link Sort.Direction#ASC} or {@link Sort.Direction#DESC}
     */
    public Sort.Direction toSortDirection() {
        return this == ASC ? Sort.Direction.ASC : Sort.Direction.DESC;
    }
}

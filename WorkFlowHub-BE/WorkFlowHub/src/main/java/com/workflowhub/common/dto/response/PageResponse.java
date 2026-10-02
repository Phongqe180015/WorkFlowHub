package com.workflowhub.common.dto.response;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Pagination-aware response wrapper.
 *
 * <pre>{@code
 * {
 *   "content": [ ... ],
 *   "page": 0,
 *   "size": 20,
 *   "totalElements": 100,
 *   "totalPages": 5,
 *   "first": true,
 *   "last": false
 * }
 * }</pre>
 *
 * <p>Use the {@link #of(Page)} factory to map directly from Spring Data's
 * {@link Page} without boilerplate in every controller.</p>
 *
 * @param <T> type of items in the page
 */
@Getter
@Builder
public class PageResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean first;
    private final boolean last;

    /**
     * Maps a Spring Data {@link Page} to a {@code PageResponse}.
     *
     * @param springPage the Page returned by a repository or service
     * @param <T>        element type
     * @return a serialisable {@code PageResponse}
     */
    public static <T> PageResponse<T> of(Page<T> springPage) {
        return PageResponse.<T>builder()
                .content(springPage.getContent())
                .page(springPage.getNumber())
                .size(springPage.getSize())
                .totalElements(springPage.getTotalElements())
                .totalPages(springPage.getTotalPages())
                .first(springPage.isFirst())
                .last(springPage.isLast())
                .build();
    }
}

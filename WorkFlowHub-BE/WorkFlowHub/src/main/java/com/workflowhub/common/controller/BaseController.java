package com.workflowhub.common.controller;

import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.common.dto.response.PageResponse;
import org.springframework.data.domain.Page;

public abstract class BaseController {

    /**
     * Returns a 200 OK response with the given payload.
     *
     * @param data the response body
     * @param <T>  the payload type
     */
    protected <T> ApiResponse<T> success(T data) {
        return ApiResponse.success(data);
    }

    /**
     * Returns a 200 OK response with the given payload and message.
     *
     * @param data    the response body
     * @param message a human-readable description
     * @param <T>     the payload type
     */
    protected <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.success(data, message);
    }

    /**
     * Returns a 201 Created response with the given payload.
     *
     * @param data the newly created resource
     * @param <T>  the payload type
     */
    protected <T> ApiResponse<T> created(T data) {
        return ApiResponse.created(data);
    }

    /**
     * Returns a 204 No Content response.
     */
    protected ApiResponse<Void> noContent() {
        return ApiResponse.noContent();
    }

    /**
     * Returns a 200 OK response wrapping a {@link PageResponse}.
     *
     * @param pageData the Spring Data Page to wrap
     * @param <T>      element type
     */
    protected <T> ApiResponse<PageResponse<T>> page(Page<T> pageData) {
        return ApiResponse.success(PageResponse.of(pageData));
    }
}

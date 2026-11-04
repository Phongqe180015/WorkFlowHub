package com.workflowhub.domain.workflow.main.controller;

import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.controller.BaseController;
import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.common.dto.response.PageResponse;
import com.workflowhub.domain.workflow.main.dto.request.CreateCommentRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateCommentRequest;
import com.workflowhub.domain.workflow.main.dto.response.CommentResponse;
import com.workflowhub.domain.workflow.main.iservice.ICommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AppConstants.API_PREFIX + "/comments")
@RequiredArgsConstructor
public class CommentController extends BaseController {

    private final ICommentService service;

    @GetMapping
    public ApiResponse<PageResponse<CommentResponse>> getPage(
            @RequestParam(required = false) String search, @ParameterObject Pageable pageable) {
        Page<CommentResponse> result = service.getPage(search, pageable);
        return page(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<CommentResponse> getById(@PathVariable Long id) {
        return success(service.getById(id));
    }

    /**
     * GET /api/v1/comments/task/{taskId}
     * Returns all comments for a specific task, ordered by createdAt ASC
     */
    @GetMapping("/task/{taskId}")
    public ApiResponse<List<CommentResponse>> getByTaskId(@PathVariable Long taskId) {
        return success(service.getByTaskId(taskId));
    }

    /**
     * GET /api/v1/comments/subtask/{subtaskId}
     * Returns all comments for a specific subtask, ordered by createdAt ASC
     */
    @GetMapping("/subtask/{subtaskId}")
    public ApiResponse<List<CommentResponse>> getBySubtaskId(@PathVariable Long subtaskId) {
        return success(service.getBySubtaskId(subtaskId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CommentResponse> create(@Valid @RequestBody CreateCommentRequest request) {
        return created(service.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<CommentResponse> update(
            @PathVariable Long id, @Valid @RequestBody UpdateCommentRequest request) {
        return success(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return noContent();
    }
}

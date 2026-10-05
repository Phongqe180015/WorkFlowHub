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

@RestController
@RequestMapping(AppConstants.API_PREFIX + "/comments")
@RequiredArgsConstructor
public class CommentController extends BaseController {

    private final ICommentService service;

    @GetMapping
    public ApiResponse<PageResponse<CommentResponse>> getPage(
            @RequestParam(required = false) String search,@ParameterObject Pageable pageable) {
        Page<CommentResponse> result = service.getPage(search, pageable);
        return page(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<CommentResponse> getById(@PathVariable Long id) {
        return success(service.getById(id));
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

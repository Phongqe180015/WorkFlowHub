package com.workflowhub.domain.workflow.main.controller;

import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.controller.BaseController;
import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.common.dto.response.PageResponse;
import com.workflowhub.domain.workflow.main.dto.request.CreateSubtaskRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateSubtaskRequest;
import com.workflowhub.domain.workflow.main.dto.response.SubtaskResponse;
import com.workflowhub.domain.workflow.main.iservice.ISubtaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AppConstants.API_PREFIX + "/subtasks")
@RequiredArgsConstructor
public class SubtaskController extends BaseController {

    private final ISubtaskService service;

    @GetMapping
    public ApiResponse<PageResponse<SubtaskResponse>> getPage(
            @RequestParam(required = false) String search, @ParameterObject Pageable pageable) {
        Page<SubtaskResponse> result = service.getPage(search, pageable);
        return page(result);
    }

    @GetMapping("/task/{taskId}")
    public ApiResponse<List<SubtaskResponse>> getByTaskId(@PathVariable Long taskId) {
        return success(service.getByTaskId(taskId));
    }

    @GetMapping("/{id}")
    public ApiResponse<SubtaskResponse> getById(@PathVariable Long id) {
        return success(service.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SubtaskResponse> create(@Valid @RequestBody CreateSubtaskRequest request) {
        return created(service.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<SubtaskResponse> update(
            @PathVariable Long id, @Valid @RequestBody UpdateSubtaskRequest request) {
        return success(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return noContent();
    }
}

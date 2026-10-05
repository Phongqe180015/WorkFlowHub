package com.workflowhub.domain.workflow.main.controller;

import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.controller.BaseController;
import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.common.dto.response.PageResponse;
import com.workflowhub.domain.workflow.main.dto.request.CreateActivityLogRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateActivityLogRequest;
import com.workflowhub.domain.workflow.main.dto.response.ActivityLogResponse;
import com.workflowhub.domain.workflow.main.iservice.IActivityLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AppConstants.API_PREFIX + "/activity-logs")
@RequiredArgsConstructor
public class ActivityLogController extends BaseController {

    private final IActivityLogService service;

    @GetMapping
    public ApiResponse<PageResponse<ActivityLogResponse>> getPage(
            @RequestParam(required = false) String search,@ParameterObject Pageable pageable) {
        Page<ActivityLogResponse> result = service.getPage(search, pageable);
        return page(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<ActivityLogResponse> getById(@PathVariable Long id) {
        return success(service.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ActivityLogResponse> create(@Valid @RequestBody CreateActivityLogRequest request) {
        return created(service.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ActivityLogResponse> update(
            @PathVariable Long id, @Valid @RequestBody UpdateActivityLogRequest request) {
        return success(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return noContent();
    }
}

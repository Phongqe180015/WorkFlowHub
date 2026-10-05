package com.workflowhub.domain.workflow.main.controller;

import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.controller.BaseController;
import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.common.dto.response.PageResponse;
import com.workflowhub.domain.workflow.main.dto.request.CreateSprintRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateSprintRequest;
import com.workflowhub.domain.workflow.main.dto.response.SprintResponse;
import com.workflowhub.domain.workflow.main.iservice.ISprintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AppConstants.API_PREFIX + "/sprints")
@RequiredArgsConstructor
public class SprintController extends BaseController {

    private final ISprintService service;

    @GetMapping
    public ApiResponse<PageResponse<SprintResponse>> getPage(
            @RequestParam(required = false) String search,@ParameterObject Pageable pageable) {
        Page<SprintResponse> result = service.getPage(search, pageable);
        return page(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<SprintResponse> getById(@PathVariable Long id) {
        return success(service.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SprintResponse> create(@Valid @RequestBody CreateSprintRequest request) {
        return created(service.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<SprintResponse> update(
            @PathVariable Long id, @Valid @RequestBody UpdateSprintRequest request) {
        return success(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return noContent();
    }
}

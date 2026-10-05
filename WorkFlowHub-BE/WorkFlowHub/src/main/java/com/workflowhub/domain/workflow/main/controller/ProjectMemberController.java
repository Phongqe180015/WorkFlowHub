package com.workflowhub.domain.workflow.main.controller;

import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.controller.BaseController;
import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.common.dto.response.PageResponse;
import com.workflowhub.domain.workflow.main.dto.request.CreateProjectMemberRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateProjectMemberRequest;
import com.workflowhub.domain.workflow.main.dto.response.ProjectMemberResponse;
import com.workflowhub.domain.workflow.main.iservice.IProjectMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AppConstants.API_PREFIX + "/project-members")
@RequiredArgsConstructor
public class ProjectMemberController extends BaseController {

    private final IProjectMemberService service;

    @GetMapping
    public ApiResponse<PageResponse<ProjectMemberResponse>> getPage(
            @RequestParam(required = false) String search,@ParameterObject Pageable pageable) {
        Page<ProjectMemberResponse> result = service.getPage(search, pageable);
        return page(result);
    }

    @GetMapping("/projects/{projectId}/users/{userId}")
    public ApiResponse<ProjectMemberResponse> getById(
            @PathVariable Long projectId, @PathVariable Long userId) {
        return success(service.getById(projectId, userId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProjectMemberResponse> create(
            @Valid @RequestBody CreateProjectMemberRequest request) {
        return created(service.create(request));
    }

    @PutMapping("/projects/{projectId}/users/{userId}")
    public ApiResponse<ProjectMemberResponse> update(
            @PathVariable Long projectId, @PathVariable Long userId,
            @Valid @RequestBody UpdateProjectMemberRequest request) {
        return success(service.update(projectId, userId, request));
    }

    @DeleteMapping("/projects/{projectId}/users/{userId}")
    public ApiResponse<Void> delete(
            @PathVariable Long projectId, @PathVariable Long userId) {
        service.delete(projectId, userId);
        return noContent();
    }
}

package com.workflowhub.domain.master.controller;

import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.controller.BaseController;
import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.common.dto.response.PageResponse;
import com.workflowhub.domain.master.dto.request.CreateProjectRequest;
import com.workflowhub.domain.master.dto.request.UpdateProjectRequest;
import com.workflowhub.domain.master.dto.response.ProjectResponse;
import com.workflowhub.domain.master.iservice.IProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import static com.workflowhub.common.constant.ApiConstants.PROJECTS;

@RestController
@RequestMapping(AppConstants.API_PREFIX + PROJECTS)
@RequiredArgsConstructor
public class ProjectController extends BaseController {

    private final IProjectService projectService;

    @GetMapping
    public ApiResponse<PageResponse<ProjectResponse>> getPage(@RequestParam(required = false) String search,@ParameterObject Pageable pageable) {
        Page<ProjectResponse> result = projectService.getPage(search, pageable);
        return page(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<ProjectResponse> getById(@PathVariable Long id) {
        return success(projectService.getProjectById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProjectResponse> create(@Valid @RequestBody CreateProjectRequest request) {
        return created(projectService.createProject(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProjectResponse> update(@PathVariable Long id,@Valid @RequestBody UpdateProjectRequest request) {
        return success(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        projectService.deleteProject(id);
        return noContent();
    }

    @GetMapping("/my-project")
    public ApiResponse<PageResponse<ProjectResponse>> getMyProjects(@ParameterObject Pageable pageable) {
        Page<ProjectResponse> projectResponses = projectService.getMyProject(pageable);
        return page(projectResponses);
    }
}

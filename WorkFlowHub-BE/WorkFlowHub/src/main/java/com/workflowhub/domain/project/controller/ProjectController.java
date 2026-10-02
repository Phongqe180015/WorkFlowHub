package com.workflowhub.domain.project.controller;

import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.controller.BaseController;
import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.common.dto.response.PageResponse;
import com.workflowhub.domain.project.entity.Project;
import com.workflowhub.domain.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(AppConstants.API_PREFIX + "/projects")
@RequiredArgsConstructor
public class ProjectController extends BaseController {

    private final ProjectService projectService;

    /**
     * GET /api/v1/projects?search=status==ACTIVE&page=0&size=20&sortBy=name&sortDirection=ASC
     */
    @GetMapping
    public ApiResponse<PageResponse<Project>> list(@RequestParam(required = false) String search,@ModelAttribute Pageable pageable) {
        Page<Project> result = projectService.getPage(search, pageable);
        return page(result);
    }

    /**
     * GET /api/v1/projects/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<Project> getById(@PathVariable UUID id) {
        return success(projectService.findById(id));
    }

    /**
     * POST /api/v1/projects
     *
     * <p>In production: accept a {@code @RequestBody @Valid CreateProjectRequest}</p>
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Project> create(@RequestBody Project project) {
        return created(projectService.save(project));
    }

    /**
     * PUT /api/v1/projects/{id}
     */
    @PutMapping("/{id}")
    public ApiResponse<Project> update(
            @PathVariable UUID id,
            @RequestBody Project project) {
        return success(projectService.update(id, project));
    }

    /**
     * DELETE /api/v1/projects/{id}
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        projectService.deleteById(id);
        return noContent();
    }
}

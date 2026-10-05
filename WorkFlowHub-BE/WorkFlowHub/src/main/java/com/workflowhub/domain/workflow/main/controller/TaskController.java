package com.workflowhub.domain.workflow.main.controller;

import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.controller.BaseController;
import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.common.dto.response.PageResponse;
import com.workflowhub.domain.workflow.main.dto.request.CreateTaskRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateTaskRequest;
import com.workflowhub.domain.workflow.main.dto.response.TaskResponse;
import com.workflowhub.domain.workflow.main.iservice.ITaskService;
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

@RestController
@RequestMapping(AppConstants.API_PREFIX + "/tasks")
@RequiredArgsConstructor
public class TaskController extends BaseController {

    private final ITaskService taskService;

    @GetMapping
    public ApiResponse<PageResponse<TaskResponse>> getPage(@RequestParam(required = false) String search,@ParameterObject Pageable pageable) {
        Page<TaskResponse> result = taskService.getPage(search, pageable);
        return page(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<TaskResponse> getById(@PathVariable Long id) {
        return success(taskService.getTaskById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TaskResponse> create(@Valid @RequestBody CreateTaskRequest request) {
        return created(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<TaskResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateTaskRequest request) {
        return success(taskService.updateTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return noContent();
    }
}

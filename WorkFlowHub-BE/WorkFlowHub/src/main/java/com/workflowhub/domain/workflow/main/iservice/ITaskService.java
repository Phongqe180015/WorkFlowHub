package com.workflowhub.domain.workflow.main.iservice;

import com.workflowhub.domain.workflow.main.dto.request.CreateTaskRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateTaskRequest;
import com.workflowhub.domain.workflow.main.dto.response.TaskResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ITaskService {

    Page<TaskResponse> getPage(String search, Pageable pageable);

    TaskResponse getTaskById(Long id);

    TaskResponse createTask(CreateTaskRequest request);

    TaskResponse updateTask(Long id, UpdateTaskRequest request);

    void deleteTask(Long id);
}

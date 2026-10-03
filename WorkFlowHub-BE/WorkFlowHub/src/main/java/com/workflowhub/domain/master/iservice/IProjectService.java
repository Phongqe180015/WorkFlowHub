package com.workflowhub.domain.master.iservice;

import com.workflowhub.domain.master.dto.request.CreateProjectRequest;
import com.workflowhub.domain.master.dto.request.UpdateProjectRequest;
import com.workflowhub.domain.master.dto.response.ProjectResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IProjectService {

    Page<ProjectResponse> getPage(String search, Pageable pageable);

    ProjectResponse getProjectById(Long id);

    ProjectResponse createProject(CreateProjectRequest request);

    ProjectResponse updateProject(Long id, UpdateProjectRequest request);

    void deleteProject(Long id);
}

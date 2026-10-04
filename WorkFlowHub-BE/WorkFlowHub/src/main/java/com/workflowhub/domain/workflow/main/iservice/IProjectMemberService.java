package com.workflowhub.domain.workflow.main.iservice;

import com.workflowhub.domain.workflow.main.dto.request.CreateProjectMemberRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateProjectMemberRequest;
import com.workflowhub.domain.workflow.main.dto.response.ProjectMemberResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IProjectMemberService {

    Page<ProjectMemberResponse> getPage(String search, Pageable pageable);

    ProjectMemberResponse getById(Long projectId, Long userId);

    ProjectMemberResponse create(CreateProjectMemberRequest request);

    ProjectMemberResponse update(Long projectId, Long userId, UpdateProjectMemberRequest request);

    void delete(Long projectId, Long userId);
}

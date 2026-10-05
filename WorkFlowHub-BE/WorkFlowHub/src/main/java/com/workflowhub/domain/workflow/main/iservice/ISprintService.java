package com.workflowhub.domain.workflow.main.iservice;

import com.workflowhub.domain.workflow.main.dto.request.CreateSprintRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateSprintRequest;
import com.workflowhub.domain.workflow.main.dto.response.SprintResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ISprintService {

    Page<SprintResponse> getPage(String search, Pageable pageable);

    SprintResponse getById(Long id);

    SprintResponse create(CreateSprintRequest request);

    SprintResponse update(Long id, UpdateSprintRequest request);

    void delete(Long id);
}

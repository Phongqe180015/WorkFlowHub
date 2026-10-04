package com.workflowhub.domain.workflow.main.iservice;

import com.workflowhub.domain.workflow.main.dto.request.CreateActivityLogRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateActivityLogRequest;
import com.workflowhub.domain.workflow.main.dto.response.ActivityLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IActivityLogService {

    Page<ActivityLogResponse> getPage(String search, Pageable pageable);

    ActivityLogResponse getById(Long id);

    ActivityLogResponse create(CreateActivityLogRequest request);

    ActivityLogResponse update(Long id, UpdateActivityLogRequest request);

    void delete(Long id);
}

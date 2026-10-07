package com.workflowhub.domain.workflow.main.iservice;

import com.workflowhub.domain.workflow.main.dto.request.CreateSubtaskRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateSubtaskRequest;
import com.workflowhub.domain.workflow.main.dto.response.SubtaskResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ISubtaskService {

    Page<SubtaskResponse> getPage(String search, Pageable pageable);

    List<SubtaskResponse> getByTaskId(Long taskId);

    SubtaskResponse getById(Long id);

    SubtaskResponse create(CreateSubtaskRequest request);

    SubtaskResponse update(Long id, UpdateSubtaskRequest request);

    void delete(Long id);
}

package com.workflowhub.domain.workflow.main.iservice;

import com.workflowhub.domain.workflow.main.dto.request.CreateAttachmentRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateAttachmentRequest;
import com.workflowhub.domain.workflow.main.dto.response.AttachmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IAttachmentService {

    Page<AttachmentResponse> getPage(String search, Pageable pageable);

    AttachmentResponse getById(Long id);

    AttachmentResponse create(CreateAttachmentRequest request);

    AttachmentResponse update(Long id, UpdateAttachmentRequest request);

    void delete(Long id);
}

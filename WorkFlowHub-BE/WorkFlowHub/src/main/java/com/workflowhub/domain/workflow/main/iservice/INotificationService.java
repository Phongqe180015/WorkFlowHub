package com.workflowhub.domain.workflow.main.iservice;

import com.workflowhub.domain.workflow.main.dto.request.CreateNotificationRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateNotificationRequest;
import com.workflowhub.domain.workflow.main.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface INotificationService {

    Page<NotificationResponse> getPage(String search, Pageable pageable);

    NotificationResponse getById(Long id);

    NotificationResponse create(CreateNotificationRequest request);

    NotificationResponse update(Long id, UpdateNotificationRequest request);

    void delete(Long id);
}

package com.workflowhub.domain.workflow.main.controller;

import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.controller.BaseController;
import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.common.dto.response.PageResponse;
import com.workflowhub.domain.workflow.main.dto.request.CreateNotificationRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateNotificationRequest;
import com.workflowhub.domain.workflow.main.dto.response.NotificationResponse;
import com.workflowhub.domain.workflow.main.iservice.INotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AppConstants.API_PREFIX + "/notifications")
@RequiredArgsConstructor
public class NotificationController extends BaseController {

    private final INotificationService service;

    @GetMapping
    public ApiResponse<PageResponse<NotificationResponse>> getPage(
            @RequestParam(required = false) String search, Pageable pageable) {
        Page<NotificationResponse> result = service.getPage(search, pageable);
        return page(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<NotificationResponse> getById(@PathVariable Long id) {
        return success(service.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NotificationResponse> create(@Valid @RequestBody CreateNotificationRequest request) {
        return created(service.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<NotificationResponse> update(
            @PathVariable Long id, @Valid @RequestBody UpdateNotificationRequest request) {
        return success(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return noContent();
    }
}

package com.workflowhub.domain.workflow.main.controller;

import com.workflowhub.common.constant.AppConstants;
import com.workflowhub.common.controller.BaseController;
import com.workflowhub.common.dto.response.ApiResponse;
import com.workflowhub.common.dto.response.PageResponse;
import com.workflowhub.domain.workflow.main.dto.request.CreateAttachmentRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateAttachmentRequest;
import com.workflowhub.domain.workflow.main.dto.response.AttachmentResponse;
import com.workflowhub.domain.workflow.main.iservice.IAttachmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AppConstants.API_PREFIX + "/attachments")
@RequiredArgsConstructor
public class AttachmentController extends BaseController {

    private final IAttachmentService service;

    @GetMapping
    public ApiResponse<PageResponse<AttachmentResponse>> getPage(
            @RequestParam(required = false) String search, Pageable pageable) {
        Page<AttachmentResponse> result = service.getPage(search, pageable);
        return page(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<AttachmentResponse> getById(@PathVariable Long id) {
        return success(service.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AttachmentResponse> create(@Valid @RequestBody CreateAttachmentRequest request) {
        return created(service.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<AttachmentResponse> update(
            @PathVariable Long id, @Valid @RequestBody UpdateAttachmentRequest request) {
        return success(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return noContent();
    }
}

package com.workflowhub.domain.workflow.main.iservice;

import com.workflowhub.domain.workflow.main.dto.request.CreateCommentRequest;
import com.workflowhub.domain.workflow.main.dto.request.UpdateCommentRequest;
import com.workflowhub.domain.workflow.main.dto.response.CommentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ICommentService {

    Page<CommentResponse> getPage(String search, Pageable pageable);

    CommentResponse getById(Long id);

    CommentResponse create(CreateCommentRequest request);

    CommentResponse update(Long id, UpdateCommentRequest request);

    void delete(Long id);
}

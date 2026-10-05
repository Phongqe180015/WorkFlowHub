package com.workflowhub.domain.workflow.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentResponse {

    private Long id;
    private Long taskId;
    private String fileUrl;
    private String fileName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

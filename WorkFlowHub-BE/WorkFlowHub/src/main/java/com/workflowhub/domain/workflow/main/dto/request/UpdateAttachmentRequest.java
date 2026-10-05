package com.workflowhub.domain.workflow.main.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAttachmentRequest {

    private String fileUrl;

    @Size(max = 255, message = "File name cannot exceed 255 characters")
    private String fileName;
}

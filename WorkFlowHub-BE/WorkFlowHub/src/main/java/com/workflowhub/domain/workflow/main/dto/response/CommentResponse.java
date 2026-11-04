package com.workflowhub.domain.workflow.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    private Long id;
    private Long taskId;
    private Long subtaskId;
    private Long userId;
    private String userName;
    private String userAvatar;
    private String content;
    private List<Long> mentionedUserIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

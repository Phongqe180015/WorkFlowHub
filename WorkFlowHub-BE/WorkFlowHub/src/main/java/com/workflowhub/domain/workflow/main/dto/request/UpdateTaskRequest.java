package com.workflowhub.domain.workflow.main.dto.request;

import com.workflowhub.common.constant.MessageCode;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTaskRequest {

    private Long projectId;

    private Long sprintId;

    private Long assigneeId;

    @Size(max = 255, message = MessageCode.BAD_REQUEST_DATA_LENGTH_INVALID)
    private String title;

    private String description;

    @Size(max = 50, message = MessageCode.BAD_REQUEST_DATA_LENGTH_INVALID)
    private String estimate;

    @Size(max = 50, message = MessageCode.BAD_REQUEST_DATA_LENGTH_INVALID)
    private String priority;

    @Size(max = 50, message = MessageCode.BAD_REQUEST_DATA_LENGTH_INVALID)
    private String status;

    private LocalDate dueDate;

    @Size(max = 50, message = MessageCode.BAD_REQUEST_DATA_LENGTH_INVALID)
    private String taskCode;

    private Boolean isDeleted;
}

package com.workflowhub.domain.workflow.main.dto.request;

import com.workflowhub.common.constant.MessageCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateSubtaskRequest {

    @NotNull(message = MessageCode.BAD_REQUEST_DATA_MISSED_FIELD)
    private Long taskId;

    @NotBlank(message = MessageCode.BAD_REQUEST_DATA_MISSED_FIELD)
    @Size(max = 255, message = MessageCode.BAD_REQUEST_DATA_LENGTH_INVALID)
    private String title;

    @Size(max = 400, message = MessageCode.BAD_REQUEST_DATA_LENGTH_INVALID)
    private String description;

    private Boolean isCompleted;

    private Long assigneeId;

    @Size(max = 50, message = MessageCode.BAD_REQUEST_DATA_LENGTH_INVALID)
    private String estimate;

    @Size(max = 50, message = MessageCode.BAD_REQUEST_DATA_LENGTH_INVALID)
    private String priority;

    private LocalDate dueDate;
}

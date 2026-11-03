package com.workflowhub.domain.master.dto.request;

import com.workflowhub.common.constant.MessageCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = MessageCode.BAD_REQUEST_DATA_MISSED_FIELD)
    @Size(max = 255, message = MessageCode.BAD_REQUEST_DATA_LENGTH_INVALID)
    private String name;

    private String avatar;
}

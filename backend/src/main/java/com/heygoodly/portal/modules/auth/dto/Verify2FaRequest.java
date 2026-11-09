package com.heygoodly.portal.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Verify2FaRequest {

    @NotBlank(message = "{validation.auth.temp_token.required}")
    private String tempToken;

    private Integer otpCode;

    private String recoveryCode;
}

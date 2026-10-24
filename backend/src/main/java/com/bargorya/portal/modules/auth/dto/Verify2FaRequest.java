package com.bargorya.portal.modules.auth.dto;

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

    @NotBlank(message = "Temporary token is required.")
    private String tempToken;

    @NotNull(message = "OTP code is required.")
    private Integer otpCode;

    private String recoveryCode;
}

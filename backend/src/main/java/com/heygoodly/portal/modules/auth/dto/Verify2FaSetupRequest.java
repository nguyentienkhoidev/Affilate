package com.heygoodly.portal.modules.auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Verify2FaSetupRequest {

    @NotNull(message = "{validation.auth.otp.required}")
    private Integer otpCode;

    private String secretKey;

    private List<String> recoveryCodes;
}

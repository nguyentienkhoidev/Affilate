package com.heygoodly.portal.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorDetailsResponse {

    private Boolean twoFactorEnabled;
    private String secretKey;
    private String qrCodeUri;
    private List<String> recoveryCodes;
}


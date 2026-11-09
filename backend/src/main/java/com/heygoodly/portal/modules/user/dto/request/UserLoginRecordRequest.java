package com.heygoodly.portal.modules.user.dto.request;

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
public class UserLoginRecordRequest {
    private String ipAddress;
    private String location;
    private String device;
    private String authMethod;
    private String status;
    private String duration;
}


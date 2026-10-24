package com.bargorya.portal.modules.setting.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SettingRequest {
    @NotEmpty(message = "Settings map cannot be empty.")
    private Map<String, String> settings;
}

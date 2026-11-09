package com.heygoodly.portal.modules.setting.dto.response;

import java.util.Map;

public record SettingResponse(
        Map<String, String> settings
) {}

package com.heygoodly.portal.modules.media.dto.response;

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
public class MediaItemResponse {
    private Long id;
    private String name;
    private String objectKey;
    private String bucket;
    private String url;
    private String category;
    private Long sizeBytes;
    private String size;
    private String mimeType;
    private String dimensions;
    private String format;
    private List<String> tags;
    private Long uploadedBy;
    private String createdAt;
}


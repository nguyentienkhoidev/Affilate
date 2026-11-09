package com.heygoodly.portal.modules.file.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String uploadImage(MultipartFile file, String folder);
    void deleteFile(String fileUrl);
}

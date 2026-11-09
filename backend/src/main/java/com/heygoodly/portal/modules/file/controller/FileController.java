package com.heygoodly.portal.modules.file.controller;

import com.heygoodly.portal.common.constant.MessageConstants;
import com.heygoodly.portal.common.constant.PermissionConstants;
import com.heygoodly.portal.common.dto.ApiResponse;
import com.heygoodly.portal.modules.file.service.StorageService;
import com.heygoodly.portal.modules.role.enums.RoleCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/files")
@RequiredArgsConstructor
public class FileController {

    private final StorageService storageService;

    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('" + PermissionConstants.FILE_UPLOAD + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "general") String folder
    ) {
        String fileUrl = storageService.uploadImage(file, folder);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.CREATED, Map.of("url", fileUrl)));
    }

    @DeleteMapping
    @PreAuthorize("hasAuthority('" + PermissionConstants.FILE_DELETE + "') or hasAuthority('" + RoleCode.ROLE_SUPER_ADMIN + "')")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@RequestParam("url") String fileUrl) {
        storageService.deleteFile(fileUrl);
        return ResponseEntity.ok(ApiResponse.ok(MessageConstants.DELETED, null));
    }
}

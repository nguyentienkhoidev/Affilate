package com.bargorya.portal.common.util;

import com.bargorya.portal.common.constant.ErrorCodes;
import com.bargorya.portal.common.constant.StorageConstants;
import com.bargorya.portal.common.exception.BadRequestException;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.UUID;

public final class FileUtils {
    private FileUtils() {}

    public static String getExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ENGLISH);
    }

    public static void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty.", ErrorCodes.INVALID_FILE_TYPE);
        }

        if (file.getSize() > StorageConstants.MAX_IMAGE_FILE_SIZE_BYTES) {
            throw new BadRequestException("File size exceeds 10MB limit.", ErrorCodes.FILE_TOO_LARGE);
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!StorageConstants.ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Only JPEG, PNG, and WebP images are allowed.", ErrorCodes.INVALID_FILE_TYPE);
        }

        String contentType = file.getContentType();
        if (contentType == null || !StorageConstants.ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new BadRequestException("Invalid content type: " + contentType, ErrorCodes.INVALID_FILE_TYPE);
        }
    }

    public static String generateUniqueWebpFilename() {
        return UUID.randomUUID() + ".webp";
    }

    public static String sanitizeFilename(String filename) {
        if (filename == null) return "";
        // Prevent path traversal
        return filename.replace("..", "").replace("/", "").replace("\\", "");
    }
}

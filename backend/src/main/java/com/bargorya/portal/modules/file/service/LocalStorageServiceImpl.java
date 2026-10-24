package com.bargorya.portal.modules.file.service;

import com.bargorya.portal.common.constant.ErrorCodes;
import com.bargorya.portal.common.constant.StorageConstants;
import com.bargorya.portal.common.exception.BadRequestException;
import com.bargorya.portal.common.util.FileUtils;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Service
public class LocalStorageServiceImpl implements StorageService {

    private final Path basePath;

    public LocalStorageServiceImpl(@Value("${app.storage.local-path:/var/www/bargorya/uploads}") String uploadPath) {
        this.basePath = Paths.get(uploadPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.basePath);
        } catch (IOException e) {
            log.warn("Could not pre-create upload base directory {}: {}", this.basePath, e.getMessage());
        }
    }

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        FileUtils.validateImageFile(file);

        String safeFolder = FileUtils.sanitizeFilename(folder != null ? folder : "general");
        Path folderPath = this.basePath.resolve(safeFolder).normalize();

        try {
            Files.createDirectories(folderPath);

            String filename = FileUtils.generateUniqueWebpFilename();
            Path targetFile = folderPath.resolve(filename).normalize();

            // Compress and resize to max 1200px width with aspect ratio preserved
            Thumbnails.of(file.getInputStream())
                    .size(StorageConstants.FULL_SIZE_WIDTH, StorageConstants.FULL_SIZE_WIDTH)
                    .outputQuality(0.85f)
                    .toFile(targetFile.toFile());

            log.info("Saved compressed image: {}", targetFile);
            return "/uploads/" + safeFolder + "/" + filename;
        } catch (IOException e) {
            log.error("Failed to store image: ", e);
            throw new BadRequestException("Failed to upload and process image.", ErrorCodes.FILE_UPLOAD_FAILED);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            return;
        }

        String relativePath = fileUrl.substring("/uploads/".length());
        Path targetPath = this.basePath.resolve(relativePath).normalize();

        // Prevent path traversal outside basePath
        if (!targetPath.startsWith(this.basePath)) {
            log.warn("Security check failed: file delete attempt outside upload base directory: {}", fileUrl);
            return;
        }

        try {
            File file = targetPath.toFile();
            if (file.exists() && file.isFile()) {
                boolean deleted = file.delete();
                log.info("Deleted file {}: {}", targetPath, deleted);
            }
        } catch (Exception e) {
            log.error("Error deleting file {}: ", targetPath, e);
        }
    }
}

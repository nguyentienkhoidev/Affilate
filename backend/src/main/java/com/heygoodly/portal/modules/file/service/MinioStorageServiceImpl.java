package com.heygoodly.portal.modules.file.service;

import com.heygoodly.portal.common.constant.AppConstants;
import com.heygoodly.portal.common.constant.ErrorCodes;
import com.heygoodly.portal.common.exception.BadRequestException;
import com.heygoodly.portal.common.util.FileUtils;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.SetBucketPolicyArgs;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service("minioStorageService")
@Primary
public class MinioStorageServiceImpl implements StorageService {

    private final MinioClient minioClient;
    private final String bucketName;
    private final String publicUrl;
    private volatile boolean bucketInitialized = false;

    public MinioStorageServiceImpl(
            MinioClient minioClient,
            @Value("${app.minio.bucket-name:heygoodly-media}") String bucketName,
            @Value("${app.minio.public-url:http://localhost:9000}") String publicUrl
    ) {
        this.minioClient = minioClient;
        this.bucketName = bucketName;
        this.publicUrl = publicUrl.endsWith("/") ? publicUrl.substring(0, publicUrl.length() - 1) : publicUrl;
    }

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        FileUtils.validateImageFile(file);
        ensureBucketExists();

        String safeFolder = FileUtils.sanitizeFilename(folder != null ? folder : "articles");
        String originalName = file.getOriginalFilename();
        String ext = FileUtils.getExtension(originalName);
        if (ext.isEmpty()) {
            ext = "webp";
        }

        String safeBaseName = originalName != null && originalName.contains(".")
                ? originalName.substring(0, originalName.lastIndexOf('.')).replaceAll("[^a-zA-Z0-9_-]", "-")
                : AppConstants.DEFAULT_ASSET_NAME;

        String objectKey = new StringBuilder(safeFolder)
                .append(AppConstants.SLASH)
                .append(System.currentTimeMillis())
                .append(AppConstants.HYPHEN)
                .append(safeBaseName)
                .append(AppConstants.DOT)
                .append(ext)
                .toString();
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(this.bucketName)
                            .object(objectKey)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(contentType)
                            .build()
            );

            String fileUrl = new StringBuilder(this.publicUrl)
                    .append(AppConstants.SLASH)
                    .append(this.bucketName)
                    .append(AppConstants.SLASH)
                    .append(objectKey)
                    .toString();
            log.info("Uploaded file to MinIO: bucket={}, objectKey={}, url={}", this.bucketName, objectKey, fileUrl);
            return fileUrl;
        } catch (Exception e) {
            log.error("Failed to upload image to MinIO S3 storage: ", e);
            throw new BadRequestException(
                    new StringBuilder("Failed to upload image to MinIO object storage: ").append(e.getMessage()).toString(),
                    ErrorCodes.FILE_UPLOAD_FAILED);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (!org.springframework.util.StringUtils.hasText(fileUrl)) {
            return;
        }

        String objectKey = extractObjectKey(fileUrl);
        if (objectKey == null || objectKey.isBlank()) {
            log.warn("Cannot extract objectKey from fileUrl: {}", fileUrl);
            return;
        }

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(this.bucketName)
                            .object(objectKey)
                            .build()
            );
            log.info("Deleted object from MinIO: bucket={}, objectKey={}", this.bucketName, objectKey);
        } catch (Exception e) {
            log.error("Failed to delete object from MinIO: objectKey={}: ", objectKey, e);
        }
    }

    private synchronized void ensureBucketExists() {
        if (this.bucketInitialized) {
            return;
        }

        try {
            boolean found = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(this.bucketName).build()
            );
            if (!found) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(this.bucketName).build()
                );
                log.info("Created MinIO bucket: {}", this.bucketName);

                // Set public download policy
                String policyJson = """
                        {
                          "Version": "2012-10-17",
                          "Statement": [
                            {
                              "Effect": "Allow",
                              "Principal": {"AWS": ["*"]},
                              "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
                              "Resource": ["arn:aws:s3:::%s"]
                            },
                            {
                              "Effect": "Allow",
                              "Principal": {"AWS": ["*"]},
                              "Action": ["s3:GetObject"],
                              "Resource": ["arn:aws:s3:::%s/*"]
                            }
                          ]
                        }
                        """.formatted(this.bucketName, this.bucketName);

                minioClient.setBucketPolicy(
                        SetBucketPolicyArgs.builder()
                                .bucket(this.bucketName)
                                .config(policyJson)
                                .build()
                );
                log.info("Applied anonymous read-only download policy to MinIO bucket: {}", this.bucketName);
            }
            this.bucketInitialized = true;
        } catch (Exception e) {
            log.warn("MinIO bucket initialization notice: {}", e.getMessage());
        }
    }

    private String extractObjectKey(String fileUrl) {
        String marker = new StringBuilder(AppConstants.SLASH)
                .append(this.bucketName)
                .append(AppConstants.SLASH)
                .toString();
        int index = fileUrl.indexOf(marker);
        if (index != -1) {
            return fileUrl.substring(index + marker.length());
        }
        return null;
    }
}


package com.workflowhub.domain.workflow.main.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.workflowhub.common.constant.MessageCodeSystem;
import com.workflowhub.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException(MessageCodeSystem.EMPTY_FILENAME);
        }
        String contentType = file.getContentType();
        if (!contentType.startsWith("image/")) {
            throw new BadRequestException(MessageCodeSystem.INVALID_FILENAME);
        }
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "workflowhub/avatars",
                    "resource_type", "image"
            ));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Uploaded avatar successfully to Cloudinary: {}", secureUrl);
            return secureUrl;
        }catch (IOException e){
            log.error("Failed to upload image to Cloudinary", e);
            throw new BadRequestException(e.getMessage());
        }
    }
}

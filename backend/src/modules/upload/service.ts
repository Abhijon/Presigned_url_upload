import { generateObjectKey, generatePresignedUploadUrl } from "../../config/s3";
import { env } from "../../config/env";
import { AppError } from "../../utils";
import {
  ALLOWED_CONTENT_TYPES,
  AllowedContentType,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from "../../types";

/**
 * Upload Service
 *
 * Handles presigned URL generation for direct S3 uploads.
 * This module is intentionally kept independent so that
 * multipart upload support can be added later without
 * changing business logic.
 */
class UploadService {
  /**
   * Validates upload metadata and generates a presigned PUT URL.
   * The client uses this URL to upload directly to S3.
   */
  async getPresignedUploadUrl(data: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    // Validate filename
    if (!data.filename || typeof data.filename !== "string" || data.filename.trim() === "") {
      throw new AppError("Filename is required", 400);
    }

    // Validate content type - only JPG and PNG allowed
    if (!data.contentType || !ALLOWED_CONTENT_TYPES.includes(data.contentType as AllowedContentType)) {
      throw new AppError(
        `Invalid content type. Allowed types: ${ALLOWED_CONTENT_TYPES.join(", ")}`,
        400
      );
    }

    // Validate file size
    if (!data.size || typeof data.size !== "number" || data.size <= 0) {
      throw new AppError("File size must be a positive number", 400);
    }

    const maxSizeBytes = env.MAX_FILE_SIZE_MB * 1024 * 1024;
    if (data.size > maxSizeBytes) {
      throw new AppError(
        `File size exceeds maximum allowed size of ${env.MAX_FILE_SIZE_MB}MB`,
        400
      );
    }

    // Validate file extension matches content type
    const extension = data.filename.split(".").pop()?.toLowerCase();
    const validExtensions: Record<string, string[]> = {
      "image/jpeg": ["jpg", "jpeg"],
      "image/png": ["png"],
    };

    if (!extension || !validExtensions[data.contentType]?.includes(extension)) {
      throw new AppError("File extension does not match content type", 400);
    }

    // Generate unique object key and presigned URL
    const key = generateObjectKey(data.filename);
    const uploadUrl = await generatePresignedUploadUrl(key, data.contentType);

    return { key, uploadUrl };
  }
}

export default new UploadService();

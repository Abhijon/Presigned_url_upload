import {
  generateObjectKey,
  generatePresignedUploadUrl,
  initiateMultipartUpload,
  generatePresignedPartUploadUrl,
  completeMultipartUploadS3,
} from "../../config/s3";
import { env } from "../../config/env";
import { AppError } from "../../utils";
import {
  ALLOWED_CONTENT_TYPES,
  AllowedContentType,
  PresignedUrlRequest,
  PresignedUrlResponse,
  MultipartPartPresignedUrl,
  CompleteMultipartRequest,
} from "../../types";

/**
  * Upload Service
  *
  * Handles presigned URL generation for both single-file direct uploads
  * and multipart chunked uploads for large files.
  */
class UploadService {
  /**
   * Validates upload metadata and returns either a single presigned PUT URL
   * or a set of presigned part URLs for chunked multipart upload.
   */
  async getPresignedUploadUrl(data: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    // Validate filename
    if (!data.filename || typeof data.filename !== "string" || data.filename.trim() === "") {
      throw new AppError("Filename is required", 400);
    }

    // Validate content type
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
      "image/webp": ["webp"],
      "image/gif": ["gif"],
      "application/pdf": ["pdf"],
    };

    if (!extension || !validExtensions[data.contentType]?.includes(extension)) {
      throw new AppError("File extension does not match content type", 400);
    }

    // Generate unique object key
    const key = generateObjectKey(data.filename);

    const singleUploadLimitBytes = env.SINGLE_UPLOAD_LIMIT_MB * 1024 * 1024;

    // Case 1: Single file upload for files <= single upload threshold (e.g., <= 5MB)
    if (data.size <= singleUploadLimitBytes) {
      const uploadUrl = await generatePresignedUploadUrl(key, data.contentType);
      return {
        isMultipart: false,
        key,
        uploadUrl,
      };
    }

    // Case 2: Multipart chunk upload for files > single upload threshold
    const chunkSizeBytes = env.CHUNK_SIZE_MB * 1024 * 1024;
    const totalParts = Math.ceil(data.size / chunkSizeBytes);
    const uploadId = await initiateMultipartUpload(key, data.contentType);

    const parts: MultipartPartPresignedUrl[] = [];
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const uploadUrl = await generatePresignedPartUploadUrl(key, uploadId, partNumber);
      parts.push({ partNumber, uploadUrl });
    }

    return {
      isMultipart: true,
      key,
      uploadId,
      chunkSize: chunkSizeBytes,
      parts,
    };
  }

  /**
   * Finalizes an S3 multipart upload session by instructing S3 to merge all chunks.
   */
  async completeMultipartUpload(data: CompleteMultipartRequest): Promise<void> {
    if (!data.key || typeof data.key !== "string" || data.key.trim() === "") {
      throw new AppError("Key is required for completing multipart upload", 400);
    }

    if (!data.uploadId || typeof data.uploadId !== "string" || data.uploadId.trim() === "") {
      throw new AppError("UploadId is required for completing multipart upload", 400);
    }

    if (!Array.isArray(data.parts) || data.parts.length === 0) {
      throw new AppError("Parts array is required and must not be empty", 400);
    }

    console.log(`[Backend Multipart Merge] Merging S3 object "${data.key}" (UploadId: ${data.uploadId}) with parts:`, data.parts);

    try {
      await completeMultipartUploadS3(data.key, data.uploadId, data.parts);
    } catch (error: any) {
      console.error("Failed to complete S3 multipart upload:", error);
      throw new AppError(
        `Failed to merge S3 upload chunks: ${error.message || "S3 error"}`,
        500
      );
    }
  }
}

export default new UploadService();

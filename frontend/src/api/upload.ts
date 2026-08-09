import api from "./axios";
import axios from "axios";
import type {
  ApiResponse,
  PresignedUrlRequest,
  PresignedUrlResponse,
  CompleteMultipartRequest,
} from "../types";

/**
 * Upload API service.
 * Handles single presigned URL uploads, multipart chunk uploads, and completion.
 */
export const uploadApi = {
  /**
   * Requests presigned URL(s) from the backend.
   */
  async getPresignedUrl(data: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const response = await api.post<ApiResponse<PresignedUrlResponse>>(
      "/uploads/presigned-url",
      data
    );
    return response.data.data;
  },

  /**
   * Uploads a single file directly to S3 using a presigned PUT URL.
   */
  async uploadToS3(
    uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
  },

  /**
   * Uploads an individual chunk directly to S3 using its presigned PUT URL
   * and extracts the ETag header returned by S3.
   */
  async uploadChunkToS3(
    uploadUrl: string,
    chunk: Blob,
    contentType: string,
    onProgress?: (loadedBytes: number) => void
  ): Promise<string> {
    const response = await axios.put(uploadUrl, chunk, {
      headers: {
        "Content-Type": contentType,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.loaded) {
          onProgress(progressEvent.loaded);
        }
      },
    });

    const rawEtag =
      (response.headers["etag"] || response.headers["ETag"] || "") as string;
    // Strip surrounding quotes if present
    const etag = rawEtag.replace(/^"|"$/g, "");
    console.log(`[Chunk Upload] Received ETag from S3: "${etag}"`);
    return etag;
  },

  /**
   * Calls backend API to merge all uploaded chunks in S3.
   */
  async completeMultipartUpload(data: CompleteMultipartRequest): Promise<void> {
    await api.post("/uploads/complete-multipart", data);
  },
};

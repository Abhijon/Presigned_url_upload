import api from "./axios";
import axios from "axios";
import type {
  ApiResponse,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from "../types";

/**
 * Upload API service.
 * Handles presigned URL generation and direct S3 uploads.
 */
export const uploadApi = {
  /**
   * Requests a presigned PUT URL from the backend.
   */
  async getPresignedUrl(data: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const response = await api.post<ApiResponse<PresignedUrlResponse>>(
      "/uploads/presigned-url",
      data
    );
    return response.data.data;
  },

  /**
   * Uploads a file directly to S3 using the presigned PUT URL.
   * This bypasses the backend entirely.
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
};

/** Allowed MIME types for uploads */
export const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

export type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

/** Request body for presigned URL generation */
export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  size: number;
}

/** Individual chunk presigned upload URL details */
export interface MultipartPartPresignedUrl {
  partNumber: number;
  uploadUrl: string;
}

/** Response from presigned URL generation (handles single and multipart uploads) */
export interface PresignedUrlResponse {
  isMultipart: boolean;
  key: string;
  uploadUrl?: string;
  uploadId?: string;
  chunkSize?: number;
  parts?: MultipartPartPresignedUrl[];
}

/** Individual completed chunk ETag & PartNumber info */
export interface CompletedPart {
  PartNumber: number;
  ETag: string;
}

/** Payload required to finalize an S3 multipart upload merge */
export interface CompleteMultipartRequest {
  key: string;
  uploadId: string;
  parts: CompletedPart[];
}

/** Request body for creating a profile */
export interface CreateProfileRequest {
  name: string;
  email: string;
  phone: string;
  age: number;
  profilePictureKey?: string;
  multipartInfo?: CompleteMultipartRequest;
}

/** Request body for updating a profile */
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  age?: number;
  profilePictureKey?: string;
  multipartInfo?: CompleteMultipartRequest;
}

/** Profile response with resolved profile picture URL */
export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  profilePictureUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Standard API error response */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

/** Standard API success response */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

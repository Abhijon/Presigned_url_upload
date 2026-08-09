/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Presigned URL request */
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

/** Presigned URL response (single or multipart) */
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

/** Profile data from API */
export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Create profile request */
export interface CreateProfileRequest {
  name: string;
  email: string;
  phone: string;
  age: number;
  profilePictureKey?: string;
  multipartInfo?: CompleteMultipartRequest;
}

/** Update profile request */
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  age?: number;
  profilePictureKey?: string;
  multipartInfo?: CompleteMultipartRequest;
}

/** Profile form data */
export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  age: number;
}

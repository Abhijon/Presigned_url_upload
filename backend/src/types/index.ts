/** Allowed MIME types for profile picture uploads */
export const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png"] as const;

export type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

/** Request body for presigned URL generation */
export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  size: number;
}

/** Response from presigned URL generation */
export interface PresignedUrlResponse {
  key: string;
  uploadUrl: string;
}

/** Request body for creating a profile */
export interface CreateProfileRequest {
  name: string;
  email: string;
  phone: string;
  age: number;
  profilePictureKey?: string;
}

/** Request body for updating a profile */
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  age?: number;
  profilePictureKey?: string;
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

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

/** Presigned URL response */
export interface PresignedUrlResponse {
  key: string;
  uploadUrl: string;
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
}

/** Update profile request */
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  age?: number;
  profilePictureKey?: string;
}

/** Profile form data */
export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  age: number;
}

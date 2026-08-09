import { Profile } from "@prisma/client";
import profileRepository from "./repository";
import uploadService from "../upload/service";
import { generatePresignedDownloadUrl, deleteS3Object } from "../../config/s3";
import { AppError } from "../../utils";
import {
  CreateProfileRequest,
  UpdateProfileRequest,
  ProfileResponse,
} from "../../types";

/**
 * Profile Service
 *
 * Contains all business logic for profile operations.
 * Generates presigned download URLs for profile pictures dynamically.
 */
class ProfileService {
  /**
   * Transforms a Profile entity into a ProfileResponse with a resolved picture URL.
   */
  private async toResponse(profile: Profile): Promise<ProfileResponse> {
    let profilePictureUrl: string | null = null;

    if (profile.profilePictureKey) {
      profilePictureUrl = await generatePresignedDownloadUrl(profile.profilePictureKey);
    }

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      age: profile.age,
      profilePictureUrl,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  /**
   * Creates a new profile after validating required fields.
   * If a chunked multipart upload was performed, completes chunk merging in S3
   * before storing the final object key in the DB to maintain consistency.
   */
  async createProfile(data: CreateProfileRequest): Promise<ProfileResponse> {
    // Validate required fields
    if (!data.name || data.name.trim() === "") {
      throw new AppError("Name is required", 400);
    }
    if (!data.email || data.email.trim() === "") {
      throw new AppError("Email is required", 400);
    }
    if (!data.phone || data.phone.trim() === "") {
      throw new AppError("Phone is required", 400);
    }
    if (data.age === undefined || data.age === null || typeof data.age !== "number") {
      throw new AppError("Age is required and must be a number", 400);
    }
    if (data.age < 1 || data.age > 150) {
      throw new AppError("Age must be between 1 and 150", 400);
    }

    // Check for duplicate email
    const existing = await profileRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError("A profile with this email already exists", 409);
    }

    let profilePictureKey = data.profilePictureKey;

    // If multipart upload metadata is provided, complete chunk merging in S3 first
    if (data.multipartInfo) {
      await uploadService.completeMultipartUpload(data.multipartInfo);
      profilePictureKey = data.multipartInfo.key;
    }

    const profile = await profileRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      age: data.age,
      profilePictureKey,
    });
    return this.toResponse(profile);
  }

  /**
   * Retrieves a profile by ID with a dynamically generated picture URL.
   */
  async getProfile(id: string): Promise<ProfileResponse> {
    const profile = await profileRepository.findById(id);
    if (!profile) {
      throw new AppError("Profile not found", 404);
    }
    return this.toResponse(profile);
  }

  /**
   * Retrieves all profiles with dynamically generated picture URLs.
   */
  async getAllProfiles(): Promise<ProfileResponse[]> {
    const profiles = await profileRepository.findAll();
    return Promise.all(profiles.map((p) => this.toResponse(p)));
  }

  /**
   * Updates a profile.
   *
   * Order of operations for consistency:
   * 1. Read existing profile & validate
   * 2. If multipart upload info is present, complete merging in S3 first
   * 3. Update DB (point to new image key)
   * 4. Delete old image from S3 if replaced
   * 5. Return response
   */
  async updateProfile(id: string, data: UpdateProfileRequest): Promise<ProfileResponse> {
    // 1. Read existing profile
    const existingProfile = await profileRepository.findById(id);
    if (!existingProfile) {
      throw new AppError("Profile not found", 404);
    }

    // 2. Validate
    if (data.age !== undefined) {
      if (typeof data.age !== "number" || data.age < 1 || data.age > 150) {
        throw new AppError("Age must be a number between 1 and 150", 400);
      }
    }

    if (data.email && data.email !== existingProfile.email) {
      const emailExists = await profileRepository.findByEmail(data.email);
      if (emailExists) {
        throw new AppError("A profile with this email already exists", 409);
      }
    }

    let profilePictureKey = data.profilePictureKey;

    // Handle multipart chunk upload completion if provided
    if (data.multipartInfo) {
      await uploadService.completeMultipartUpload(data.multipartInfo);
      profilePictureKey = data.multipartInfo.key;
    }

    // Capture old key before DB update (needed for S3 cleanup)
    const oldPictureKey = existingProfile.profilePictureKey;
    const shouldDeleteOldPicture =
      !!profilePictureKey &&
      !!oldPictureKey &&
      profilePictureKey !== oldPictureKey;

    // 3. Update DB first — ensures DB always points to a valid merged image
    const updatePayload: UpdateProfileRequest = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      age: data.age,
      ...(profilePictureKey !== undefined ? { profilePictureKey } : {}),
    };

    const updatedProfile = await profileRepository.update(id, updatePayload);

    // 4. Delete old image from S3 (after DB is already updated)
    if (shouldDeleteOldPicture) {
      try {
        await deleteS3Object(oldPictureKey!);
      } catch (error) {
        console.error("Failed to delete old profile picture from S3:", error);
      }
    }

    // 5. Return response
    return this.toResponse(updatedProfile);
  }

  /**
   * Deletes a profile and its associated S3 object (if any).
   */
  async deleteProfile(id: string): Promise<void> {
    const profile = await profileRepository.findById(id);
    if (!profile) {
      throw new AppError("Profile not found", 404);
    }

    // Delete profile picture from S3 if it exists
    if (profile.profilePictureKey) {
      try {
        await deleteS3Object(profile.profilePictureKey);
      } catch (error) {
        console.error("Failed to delete profile picture from S3:", error);
      }
    }

    await profileRepository.delete(id);
  }
}

export default new ProfileService();

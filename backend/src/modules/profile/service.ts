import { Profile } from "@prisma/client";
import profileRepository from "./repository";
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

    const profile = await profileRepository.create(data);
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
   * 1. Read existing profile
   * 2. Validate
   * 3. Update DB (point to new image key first)
   * 4. Delete old image from S3
   * 5. Return response
   *
   * DB is updated before S3 cleanup so the database always
   * references a valid image. If S3 delete fails, we only
   * have an orphaned S3 object (harmless) rather than the
   * DB pointing to a deleted image (broken).
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

    // Capture old key before DB update (needed for S3 cleanup)
    const oldPictureKey = existingProfile.profilePictureKey;
   const shouldDeleteOldPicture =
  !!data.profilePictureKey &&
  !!oldPictureKey &&
  data.profilePictureKey !== oldPictureKey;

    // 3. Update DB first — ensures DB always points to a valid image
    const updatedProfile = await profileRepository.update(id, data);

    // 4. Delete old image from S3 (after DB is already updated)
    if (shouldDeleteOldPicture) {
      try {
        await deleteS3Object(oldPictureKey!);
      } catch (error) {
        // DB already points to new image — old S3 object is just orphaned (harmless)
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
        // Continue with profile deletion even if S3 delete fails
      }
    }

    await profileRepository.delete(id);
  }
}

export default new ProfileService();

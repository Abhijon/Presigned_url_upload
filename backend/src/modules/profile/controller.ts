import { Request, Response } from "express";
import profileService from "./service";
import { CreateProfileRequest, UpdateProfileRequest } from "../../types";

/**
 * Profile Controller
 *
 * Thin controller layer - handles HTTP concerns only.
 * All business logic is delegated to the service layer.
 */
class ProfileController {
  /**
   * POST /profiles
   */
  async create(req: Request, res: Response): Promise<void> {
    const data = req.body as CreateProfileRequest;
    const profile = await profileService.createProfile(data);

    res.status(201).json({
      success: true,
      data: profile,
    });
  }

  /**
   * GET /profiles/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const profile = await profileService.getProfile(id);

    res.status(200).json({
      success: true,
      data: profile,
    });
  }

  /**
   * GET /profiles
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    const profiles = await profileService.getAllProfiles();

    res.status(200).json({
      success: true,
      data: profiles,
    });
  }

  /**
   * PATCH /profiles/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const data = req.body as UpdateProfileRequest;
    const profile = await profileService.updateProfile(id, data);

    res.status(200).json({
      success: true,
      data: profile,
    });
  }

  /**
   * DELETE /profiles/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    await profileService.deleteProfile(id);

    res.status(200).json({
      success: true,
      data: { message: "Profile deleted successfully" },
    });
  }
}

export default new ProfileController();

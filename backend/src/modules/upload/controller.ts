import { Request, Response } from "express";
import uploadService from "./service";
import { PresignedUrlRequest } from "../../types";

/**
 * Upload Controller
 *
 * Thin controller layer - delegates all logic to the service.
 */
class UploadController {
  /**
   * POST /uploads/presigned-url
   * Generates a presigned PUT URL for direct S3 upload.
   */
  async getPresignedUrl(req: Request, res: Response): Promise<void> {
    const { filename, contentType, size } = req.body as PresignedUrlRequest;

    const result = await uploadService.getPresignedUploadUrl({
      filename,
      contentType,
      size,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  }
}

export default new UploadController();

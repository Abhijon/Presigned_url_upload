import { Request, Response } from "express";
import uploadService from "./service";
import { PresignedUrlRequest, CompleteMultipartRequest } from "../../types";

/**
 * Upload Controller
 *
 * Thin controller layer - delegates all logic to the service.
 */
class UploadController {
  /**
   * POST /uploads/presigned-url
   * Generates presigned PUT URL(s) for direct S3 upload (single or multipart).
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

  /**
   * POST /uploads/complete-multipart
   * Completes an S3 multipart upload session by merging uploaded chunks.
   */
  async completeMultipart(req: Request, res: Response): Promise<void> {
    const data = req.body as CompleteMultipartRequest;

    await uploadService.completeMultipartUpload(data);

    res.status(200).json({
      success: true,
      data: {
        message: "Multipart upload completed successfully",
      },
    });
  }
}

export default new UploadController();

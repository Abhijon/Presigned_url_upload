import { Router } from "express";
import uploadController from "./controller";
import { asyncHandler } from "../../middleware/errorHandler";

const router = Router();

router.post(
  "/presigned-url",
  asyncHandler(uploadController.getPresignedUrl.bind(uploadController))
);

router.post(
  "/complete-multipart",
  asyncHandler(uploadController.completeMultipart.bind(uploadController))
);

export default router;

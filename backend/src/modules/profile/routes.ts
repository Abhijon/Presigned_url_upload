import { Router } from "express";
import profileController from "./controller";
import { asyncHandler } from "../../middleware/errorHandler";

const router = Router();

router.post("/", asyncHandler(profileController.create.bind(profileController)));
router.get("/", asyncHandler(profileController.getAll.bind(profileController)));
router.get("/:id", asyncHandler(profileController.getById.bind(profileController)));
router.patch("/:id", asyncHandler(profileController.update.bind(profileController)));
router.delete("/:id", asyncHandler(profileController.delete.bind(profileController)));

export default router;

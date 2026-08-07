import express from "express";
import cors from "cors";
import uploadRoutes from "./modules/upload/routes";
import profileRoutes from "./modules/profile/routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

// Routes
app.use("/uploads", uploadRoutes);
app.use("/profiles", profileRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;

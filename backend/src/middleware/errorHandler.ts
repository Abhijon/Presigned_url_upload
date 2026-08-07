import { Request, Response, NextFunction } from "express";
import { AppError, getErrorMessage } from "../utils";

/**
 * Centralized error handling middleware.
 * Catches all errors thrown in route handlers and sends a consistent error response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Log unexpected errors in development
  if (process.env.NODE_ENV === "development") {
    console.error("Unhandled Error:", err);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

/**
 * Wraps an async route handler to catch errors and forward them to the error middleware.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

import { Request, Response, NextFunction } from "express";
import { ApiError } from "../types/signature";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response<ApiError>,
  next: NextFunction
): void => {
  res.status(500).json({
    error: "Internal Server Error",
    message: error.message,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

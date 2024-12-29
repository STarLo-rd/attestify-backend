import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    details: error.errors || null,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined, // Show stack trace only in development
  });

  next();
};

import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandlerMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log server errors internally without exposing secrets
  console.error(`[SERVER_ERROR] [${req.method}] ${req.path}:`, err?.message || err);

  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const code = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');
  const message = err.isPublic || statusCode < 500
    ? err.message
    : 'An unexpected server error occurred. Please try again later.';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

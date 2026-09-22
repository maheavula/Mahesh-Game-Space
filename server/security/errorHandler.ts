import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isPublic: boolean;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST', isPublic: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isPublic = isPublic;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Check if a message contains technical or system information disclosures
function containsSystemDisclosure(msg: string): boolean {
  if (!msg) return false;
  const technicalPatterns = [
    /[\\/]/, // File path separators
    /node_modules/i,
    /runtime\.json/i,
    /at\s+[a-zA-Z0-9_.]+\s+\(/i, // Stack trace line "at Function ("
    /ENOENT|EACCES|ECONNREFUSED|EADDRINUSE/i, // System error codes
    /SyntaxError|TypeError|ReferenceError|RangeError/i, // JavaScript engine errors
    /\.ts:\d+|\.js:\d+/, // File and line number leaks
  ];
  return technicalPatterns.some((pattern) => pattern.test(msg));
}

export function errorHandlerMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log server errors internally for developers/admins without exposing secrets
  console.error(`[SERVER_ERROR] [${req.method}] ${req.path}:`, err?.message || err);

  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const code = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');

  let message: string;

  // Enforce zero information disclosure for unexpected 5xx errors or technical system messages
  if (err instanceof AppError && err.isPublic && statusCode < 500) {
    message = containsSystemDisclosure(err.message)
      ? 'Invalid request parameters provided.'
      : err.message;
  } else if (statusCode === 404) {
    message = 'The requested resource was not found.';
  } else if (statusCode === 400 || statusCode === 422) {
    // Only allow safe client validation messages that do not reveal file paths or internal internals
    const rawMsg = err.message || '';
    message = containsSystemDisclosure(rawMsg)
      ? 'Request validation failed. Please verify your submitted input.'
      : rawMsg || 'Invalid request.';
  } else {
    // Clean generic message for any 5xx or unhandled system errors
    message = 'An unexpected internal error occurred. Please try again later.';
  }

  // Sanitized response payload with zero internal stack traces or path leaks
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

export class AuthError extends Error {
  status: number;
  errors?: any[];

  constructor(message: string, status: number = 400, errors?: any[]) {
    super(message);
    this.status = status;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
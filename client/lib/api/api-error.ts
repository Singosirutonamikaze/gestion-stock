export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly data?: unknown;

  constructor(message: string, statusCode = 500, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

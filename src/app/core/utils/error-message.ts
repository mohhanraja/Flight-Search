export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  if (err instanceof Error && err.name === 'TimeoutError') {
    return 'The request took too long. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}

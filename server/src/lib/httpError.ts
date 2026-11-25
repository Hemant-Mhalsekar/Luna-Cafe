export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
    /** Per-field messages, shown next to form fields (same shape as validation errors). */
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string;
}

export class ApiError extends Error {
  readonly body: ApiErrorBody;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.body = body;
  }
}

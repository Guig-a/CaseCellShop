import { ApiError, type ApiErrorBody } from '../types/api-errors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export async function apiRequest<TResponse>(
  path: string,
  options?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({
      statusCode: response.status,
      error: 'REQUEST_ERROR',
      message: 'Não foi possível concluir a operação.',
    }))) as ApiErrorBody;

    throw new ApiError(body);
  }

  return (await response.json()) as TResponse;
}

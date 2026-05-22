import { ApiError } from '../types/api-errors';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return 'Não foi possível conectar com a API. Verifique se o backend está em execução.';
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

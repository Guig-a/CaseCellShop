import { ApiError } from '../types/api-errors';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return 'Nao foi possivel conectar com a API. Verifique se o backend esta em execucao.';
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

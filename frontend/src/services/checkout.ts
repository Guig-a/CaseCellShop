import { apiRequest } from './api';
import type {
  CheckoutResponse,
  CreateCheckoutRequest,
} from '../types/checkout';

export function createCheckout(
  payload: CreateCheckoutRequest,
): Promise<CheckoutResponse> {
  return apiRequest<CheckoutResponse>('/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

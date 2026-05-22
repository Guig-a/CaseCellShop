import { useState } from 'react';
import { createCheckout } from '../services/checkout';
import type { CheckoutResponse } from '../types/checkout';
import { getErrorMessage } from '../utils/getErrorMessage';

interface UseCheckoutResult {
  order: CheckoutResponse | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  submitCheckout: (productId: string, quantity: number) => Promise<void>;
}

const CUSTOMER_ID = 'customer-1';

export function useCheckout(): UseCheckoutResult {
  const [order, setOrder] = useState<CheckoutResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submitCheckout(productId: string, quantity: number) {
    setIsSubmitting(true);
    setErrorMessage(null);
    setOrder(null);

    try {
      setOrder(
        await createCheckout({
          productId,
          quantity,
          customerId: CUSTOMER_ID,
        }),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    order,
    isSubmitting,
    errorMessage,
    submitCheckout,
  };
}

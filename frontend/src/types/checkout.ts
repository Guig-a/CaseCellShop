export interface CreateCheckoutRequest {
  productId: string;
  quantity: number;
  customerId: string;
}

export interface CheckoutResponse {
  orderId: string;
  status: 'CONFIRMED';
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

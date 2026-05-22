export type OrderStatus = 'CONFIRMED';

export interface CheckoutResponse {
  orderId: string;
  status: OrderStatus;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

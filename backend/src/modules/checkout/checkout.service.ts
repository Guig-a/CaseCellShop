import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ProductsService } from '../products/products.service';
import { InsufficientStockError, StockService } from '../stock/stock.service';
import { CreateCheckoutDto } from './checkout.dto';
import { CheckoutResponse } from './checkout.types';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly stockService: StockService,
  ) {}

  async createCheckout(dto: CreateCheckoutDto): Promise<CheckoutResponse> {
    const product = this.productsService.findById(dto.productId);

    if (!product) {
      throw new NotFoundException({
        error: 'PRODUCT_NOT_FOUND',
        message: 'Produto não encontrado.',
      });
    }

    if (dto.customerId === 'simulate-erp-timeout') {
      throw new ServiceUnavailableException({
        error: 'ERP_UNAVAILABLE',
        message:
          'Não foi possível concluir a compra no momento. Tente novamente.',
      });
    }

    try {
      await this.stockService.reserve(dto.productId, dto.quantity);
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        throw new ConflictException({
          error: 'INSUFFICIENT_STOCK',
          message: error.message,
        });
      }

      throw error;
    }

    return {
      orderId: randomUUID(),
      status: 'CONFIRMED',
      productId: product.id,
      quantity: dto.quantity,
      unitPrice: product.price,
      totalPrice: Number((product.price * dto.quantity).toFixed(2)),
      createdAt: new Date().toISOString(),
    };
  }
}

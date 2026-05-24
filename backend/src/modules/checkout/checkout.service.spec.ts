import {
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { InMemoryStore } from '../stock/in-memory.store';
import { StockService } from '../stock/stock.service';
import { CheckoutService } from './checkout.service';

describe('CheckoutService', () => {
  let store: InMemoryStore;
  let stockService: StockService;
  let service: CheckoutService;

  beforeEach(() => {
    store = new InMemoryStore();
    stockService = new StockService(store);
    service = new CheckoutService(new ProductsService(store), stockService);
  });

  it('creates an order when product has stock', async () => {
    const response = await service.createCheckout({
      productId: 'case-iphone-15',
      quantity: 2,
      customerId: 'customer-1',
    });

    expect(response).toEqual(
      expect.objectContaining({
        status: 'CONFIRMED',
        productId: 'case-iphone-15',
        quantity: 2,
        unitPrice: 49.9,
        totalPrice: 99.8,
      }),
    );
    expect(response.orderId).toEqual(expect.any(String));
    expect(response.createdAt).toEqual(expect.any(String));
  });

  it('decrements stock after a valid checkout', async () => {
    await service.createCheckout({
      productId: 'case-iphone-15',
      quantity: 1,
      customerId: 'customer-1',
    });

    expect(stockService.getAvailable('case-iphone-15')).toBe(4);
  });

  it('rejects checkout when product does not exist', async () => {
    await expect(
      service.createCheckout({
        productId: 'missing-product',
        quantity: 1,
        customerId: 'customer-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects checkout when stock is insufficient', async () => {
    await expect(
      service.createCheckout({
        productId: 'case-moto-g84',
        quantity: 2,
        customerId: 'customer-1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(stockService.getAvailable('case-moto-g84')).toBe(1);
  });

  it('prevents overselling when two purchases happen concurrently', async () => {
    const results = await Promise.allSettled([
      service.createCheckout({
        productId: 'case-moto-g84',
        quantity: 1,
        customerId: 'customer-1',
      }),
      service.createCheckout({
        productId: 'case-moto-g84',
        quantity: 1,
        customerId: 'customer-2',
      }),
    ]);

    const fulfilled = results.filter((result) => result.status === 'fulfilled');
    const rejected = results.filter((result) => result.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(stockService.getAvailable('case-moto-g84')).toBe(0);
  });

  it('returns service unavailable when ERP timeout is simulated', async () => {
    await expect(
      service.createCheckout({
        productId: 'case-iphone-15',
        quantity: 1,
        customerId: 'simulate-erp-timeout',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(stockService.getAvailable('case-iphone-15')).toBe(5);
  });
});

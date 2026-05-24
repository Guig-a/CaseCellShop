import { Injectable } from '@nestjs/common';
import { InMemoryStore } from './in-memory.store';

export class InsufficientStockError extends Error {
  constructor(
    readonly available: number,
    readonly requested: number,
  ) {
    super(
      `Estoque insuficiente. Disponível: ${available}, solicitado: ${requested}.`,
    );
  }
}

@Injectable()
export class StockService {
  private queue = Promise.resolve();

  constructor(private readonly store: InMemoryStore) {}

  getAvailable(productId: string): number {
    return this.store.getStock(productId);
  }

  reserve(productId: string, quantity: number): Promise<number> {
    return this.runExclusive(() => {
      const available = this.store.getStock(productId);

      if (available < quantity) {
        throw new InsufficientStockError(available, quantity);
      }

      const nextStock = available - quantity;
      this.store.setStock(productId, nextStock);

      return nextStock;
    });
  }

  release(productId: string, quantity: number): Promise<number> {
    return this.runExclusive(() => {
      const nextStock = this.store.getStock(productId) + quantity;
      this.store.setStock(productId, nextStock);

      return nextStock;
    });
  }

  reset(stock: Record<string, number>): void {
    this.store.resetStock(stock);
    this.queue = Promise.resolve();
  }

  private runExclusive<T>(operation: () => T): Promise<T> {
    const run = this.queue.then(operation, operation);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );

    return run;
  }
}

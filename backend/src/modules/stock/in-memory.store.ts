import { Injectable } from '@nestjs/common';
import { Product } from '../products/product.model';

interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price: number;
}

@Injectable()
export class InMemoryStore {
  private readonly products = new Map<string, ProductRecord>([
    [
      'case-iphone-15',
      {
        id: 'case-iphone-15',
        name: 'Capinha Transparente iPhone 15',
        description: 'Capinha flexivel transparente com protecao contra impacto.',
        price: 49.9,
      },
    ],
    [
      'case-galaxy-s24',
      {
        id: 'case-galaxy-s24',
        name: 'Capinha Silicone Galaxy S24',
        description: 'Capinha de silicone fosca com toque macio.',
        price: 59.9,
      },
    ],
    [
      'case-moto-g84',
      {
        id: 'case-moto-g84',
        name: 'Capinha Anti-impacto Moto G84',
        description: 'Capinha reforcada com bordas elevadas.',
        price: 39.9,
      },
    ],
  ]);

  private stock = new Map<string, number>([
    ['case-iphone-15', 5],
    ['case-galaxy-s24', 2],
    ['case-moto-g84', 1],
  ]);

  findProduct(productId: string): Product | null {
    const product = this.products.get(productId);

    if (!product) {
      return null;
    }

    return {
      ...product,
      availableStock: this.getStock(productId),
    };
  }

  listProducts(): Product[] {
    return Array.from(this.products.values()).map((product) => ({
      ...product,
      availableStock: this.getStock(product.id),
    }));
  }

  getStock(productId: string): number {
    return this.stock.get(productId) ?? 0;
  }

  setStock(productId: string, quantity: number): void {
    this.stock.set(productId, quantity);
  }

  resetStock(stock: Record<string, number>): void {
    this.stock = new Map(Object.entries(stock));
  }
}

import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../stock/in-memory.store';
import { Product } from './product.model';

@Injectable()
export class ProductsService {
  constructor(private readonly store: InMemoryStore) {}

  findAll(): Product[] {
    return this.store.listProducts();
  }

  findById(productId: string): Product | null {
    return this.store.findProduct(productId);
  }
}

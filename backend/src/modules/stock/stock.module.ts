import { Module } from '@nestjs/common';
import { InMemoryStore } from './in-memory.store';
import { StockService } from './stock.service';

@Module({
  providers: [InMemoryStore, StockService],
  exports: [InMemoryStore, StockService],
})
export class StockModule {}

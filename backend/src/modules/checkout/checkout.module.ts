import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { StockModule } from '../stock/stock.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

@Module({
  imports: [ProductsModule, StockModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}

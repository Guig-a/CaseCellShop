import { Module } from '@nestjs/common';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [ProductsModule, CheckoutModule],
})
export class AppModule {}

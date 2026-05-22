import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './checkout.dto';
import { CheckoutResponse } from './checkout.types';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCheckoutDto): Promise<CheckoutResponse> {
    return this.checkoutService.createCheckout(dto);
  }
}

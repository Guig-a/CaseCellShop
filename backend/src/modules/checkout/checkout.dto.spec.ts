import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCheckoutDto } from './checkout.dto';

describe('CreateCheckoutDto', () => {
  it('accepts a valid checkout payload', async () => {
    const dto = plainToInstance(CreateCheckoutDto, {
      productId: 'case-iphone-15',
      quantity: 1,
      customerId: 'customer-1',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects quantity lower than one', async () => {
    const dto = plainToInstance(CreateCheckoutDto, {
      productId: 'case-iphone-15',
      quantity: 0,
      customerId: 'customer-1',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('quantity');
  });

  it('rejects missing required fields', async () => {
    const dto = plainToInstance(CreateCheckoutDto, {});

    const errors = await validate(dto);
    const invalidFields = errors.map((error) => error.property);

    expect(invalidFields).toEqual(
      expect.arrayContaining(['productId', 'quantity', 'customerId']),
    );
  });
});

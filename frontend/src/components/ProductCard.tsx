import { useState } from 'react';
import type { Product } from '../types/product';
import { CheckoutButton } from './CheckoutButton';
import { QuantitySelector } from './QuantitySelector';

interface ProductCardProps {
  product: Product;
  isSubmitting: boolean;
  onCheckout: (productId: string, quantity: number) => Promise<void>;
}

export function ProductCard({
  product,
  isSubmitting,
  onCheckout,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.availableStock === 0;
  const isAboveAvailableStock = quantity > product.availableStock;
  const isInvalidQuantity =
    quantity < 1 || isAboveAvailableStock || !Number.isInteger(quantity);
  const isDisabled = isSubmitting || isOutOfStock || isInvalidQuantity;

  function handleQuantityChange(nextQuantity: number) {
    setQuantity(nextQuantity);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDisabled) {
      return;
    }

    await onCheckout(product.id, quantity);
  }

  return (
    <article className="product-card">
      <div>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
      </div>

      <dl className="product-meta">
        <div>
          <dt>Preço</dt>
          <dd>{formatCurrency(product.price)}</dd>
        </div>
        <div>
          <dt>Estoque</dt>
          <dd>{product.availableStock}</dd>
        </div>
      </dl>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <QuantitySelector
          value={quantity}
          max={Math.max(product.availableStock, 1)}
          disabled={isSubmitting || isOutOfStock}
          onChange={handleQuantityChange}
        />
        {isAboveAvailableStock && (
          <p className="field-error">
            Quantidade maior que o estoque disponível.
          </p>
        )}
        <CheckoutButton disabled={isDisabled} isSubmitting={isSubmitting} />
      </form>
    </article>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

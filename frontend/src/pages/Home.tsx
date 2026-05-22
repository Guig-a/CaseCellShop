import { ProductCard } from '../components/ProductCard';
import { StatusMessage } from '../components/StatusMessage';
import { useCheckout } from '../hooks/useCheckout';
import { useProducts } from '../hooks/useProducts';

export function Home() {
  const {
    products,
    isLoading: isLoadingProducts,
    errorMessage: productsErrorMessage,
    refetch,
  } = useProducts();
  const {
    order,
    isSubmitting,
    errorMessage: checkoutErrorMessage,
    submitCheckout,
  } = useCheckout();

  async function handleCheckout(productId: string, quantity: number) {
    await submitCheckout(productId, quantity);
    await refetch();
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">CaseCellShop</p>
        <h1>Checkout de capinhas</h1>
        <p>
          Escolha uma capinha, informe a quantidade e finalize a compra com
          validacao de estoque em tempo real.
        </p>
      </section>

      <section className="products-section" aria-label="Produtos disponiveis">
        {isLoadingProducts && (
          <StatusMessage variant="info">Carregando produtos...</StatusMessage>
        )}

        {productsErrorMessage && (
          <StatusMessage variant="error">{productsErrorMessage}</StatusMessage>
        )}

        {checkoutErrorMessage && (
          <StatusMessage variant="error">{checkoutErrorMessage}</StatusMessage>
        )}

        {order && (
          <StatusMessage variant="success">
            Compra confirmada! Pedido {order.orderId.slice(0, 8)} no valor de{' '}
            {formatCurrency(order.totalPrice)}.
          </StatusMessage>
        )}

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSubmitting={isSubmitting}
              onCheckout={handleCheckout}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

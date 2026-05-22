interface CheckoutButtonProps {
  disabled: boolean;
  isSubmitting: boolean;
}

export function CheckoutButton({
  disabled,
  isSubmitting,
}: CheckoutButtonProps) {
  return (
    <button className="checkout-button" type="submit" disabled={disabled}>
      {isSubmitting ? 'Finalizando compra...' : 'Comprar agora'}
    </button>
  );
}

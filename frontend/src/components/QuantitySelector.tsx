interface QuantitySelectorProps {
  value: number;
  max: number;
  disabled: boolean;
  onChange: (quantity: number) => void;
}

export function QuantitySelector({
  value,
  max,
  disabled,
  onChange,
}: QuantitySelectorProps) {
  return (
    <label className="quantity-selector">
      Quantidade
      <input
        min="1"
        max={max}
        type="number"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

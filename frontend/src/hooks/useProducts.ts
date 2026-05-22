import { useEffect, useState } from 'react';
import { getProducts } from '../services/products';
import type { Product } from '../types/product';
import { getErrorMessage } from '../utils/getErrorMessage';

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function fetchProducts() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setProducts(await getProducts());
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchProducts();
  }, []);

  return {
    products,
    isLoading,
    errorMessage,
    refetch: fetchProducts,
  };
}

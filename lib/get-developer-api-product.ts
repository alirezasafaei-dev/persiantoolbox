import { developerApiProducts } from '@/lib/developer-api-catalog';
import type { DeveloperApiProduct } from '@/lib/developer-api-catalog';

export function getDeveloperApiProductOrThrow(id: string): DeveloperApiProduct {
  const product = developerApiProducts.find((item) => item.id === id);
  if (!product) {
    throw new Error(`Developer API product not found: ${id}`);
  }
  return product;
}

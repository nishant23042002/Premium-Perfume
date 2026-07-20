type Variant = {
  sku: string;
  sizeMl: number;
  price: number;
  compareAtPrice?: number | null;
  isDefault?: boolean | null;
};

export function getDefaultVariant<T extends Variant>(variants: T[]): T {
  return variants.find((v) => v.isDefault) ?? variants[0];
}

import { connectToDatabase } from "@/lib/db/connect";
import { ProductModel } from "@/models/Product";

export type ProductCardData = {
  _id: string;
  name: string;
  slug: string;
  images: { publicId: string; alt: string }[];
  variants: {
    sku: string;
    sizeMl: number;
    price: number;
    compareAtPrice?: number;
    isDefault?: boolean;
  }[];
  rating: { average: number; count: number };
  isBestseller: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
};

const CARD_PROJECTION =
  "name slug images variants rating isBestseller isNewArrival isLimitedEdition";

export async function getBestsellerProducts(limit = 4): Promise<ProductCardData[]> {
  await connectToDatabase();
  const products = await ProductModel.find({ status: "active", isBestseller: true }, CARD_PROJECTION)
    .sort({ "rating.average": -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

export async function getNewArrivals(limit = 4): Promise<ProductCardData[]> {
  await connectToDatabase();
  const products = await ProductModel.find({ status: "active", isNewArrival: true }, CARD_PROJECTION)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

export type SortOption = "newest" | "price-asc" | "price-desc" | "rating";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const SORT_MAP: Record<SortOption, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  "price-asc": { minPrice: 1 },
  "price-desc": { minPrice: -1 },
  rating: { "rating.average": -1 },
};

export type ProductListParams = {
  categoryId?: string;
  productIds?: string[];
  concentrations?: string[];
  sort?: SortOption;
  page?: number;
  pageSize?: number;
};

export type ProductListResult = {
  products: ProductCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getProductList(params: ProductListParams): Promise<ProductListResult> {
  await connectToDatabase();

  const {
    categoryId,
    productIds,
    concentrations,
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = params;

  const filter: Record<string, unknown> = { status: "active" };
  if (categoryId) filter.categoryIds = categoryId;
  if (productIds) filter._id = { $in: productIds };
  if (concentrations && concentrations.length > 0) filter.concentration = { $in: concentrations };

  const sortSpec = SORT_MAP[sort] ?? SORT_MAP.newest;
  const skip = (page - 1) * pageSize;

  const [products, total] = await Promise.all([
    ProductModel.find(filter, CARD_PROJECTION).sort(sortSpec).skip(skip).limit(pageSize).lean(),
    ProductModel.countDocuments(filter),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

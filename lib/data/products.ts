import { cache } from "react";
import { connectToDatabase } from "@/lib/db/connect";
import { ProductModel } from "@/models/Product";
import { CategoryModel } from "@/models/Category";
import { SORT_OPTIONS, type SortOption } from "@/lib/product-sort";

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { SORT_OPTIONS, type SortOption };

export type ProductCardData = {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  images: { publicId: string; alt: string }[];
  variants: {
    sku: string;
    sizeMl: number;
    price: number;
    compareAtPrice?: number;
    stock: number;
    isDefault?: boolean;
  }[];
  rating: { average: number; count: number };
  isBestseller: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  isComingSoon: boolean;
};

const CARD_PROJECTION =
  "name slug shortDescription images variants rating isBestseller isNewArrival isLimitedEdition isComingSoon";

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

export async function getComingSoonProducts(limit = 4): Promise<ProductCardData[]> {
  await connectToDatabase();
  const products = await ProductModel.find({ status: "active", isComingSoon: true }, CARD_PROJECTION)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

export type AdminProduct = {
  _id: string;
  name: string;
  slug: string;
  images: { publicId: string; alt: string }[];
};

/** Lightweight product list for the temporary admin panel's product picker. */
export async function getProductsForAdmin(): Promise<AdminProduct[]> {
  await connectToDatabase();
  const products = await ProductModel.find({}, "name slug images").sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(products));
}

/** General-purpose "You May Also Like" pool — used by the cart drawer,
 * checkout upsell, and the header search's featured grid, all in the same
 * request. Wrapped in `cache()` so those callers share one query instead of
 * each firing their own — as long as they pass the same `limit`. */
export const getRecommendedProducts = cache(async (limit = 8): Promise<ProductCardData[]> => {
  await connectToDatabase();
  const products = await ProductModel.find({ status: "active" }, CARD_PROJECTION)
    .sort({ "rating.average": -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(products));
});

const SORT_MAP: Record<SortOption, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  "price-asc": { minPrice: 1 },
  "price-desc": { minPrice: -1 },
  rating: { "rating.average": -1 },
};

export type ProductListParams = {
  categoryId?: string;
  productIds?: string[];
  isBestseller?: boolean;
  isComingSoon?: boolean;
  concentrations?: string[];
  query?: string;
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
    isBestseller,
    isComingSoon,
    concentrations,
    query,
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = params;

  const filter: Record<string, unknown> = { status: "active" };
  if (categoryId) filter.categoryIds = categoryId;
  if (productIds) filter._id = { $in: productIds };
  if (isBestseller) filter.isBestseller = true;
  if (isComingSoon) filter.isComingSoon = true;
  if (concentrations && concentrations.length > 0) filter.concentration = { $in: concentrations };

  const trimmedQuery = query?.trim();
  if (trimmedQuery) {
    const re = new RegExp(escapeRegExp(trimmedQuery), "i");
    const matchingCategories = await CategoryModel.find({ name: re }, "_id").lean();

    const orConditions: Record<string, unknown>[] = [
      { name: re },
      { shortDescription: re },
      { concentration: re },
    ];
    if (matchingCategories.length > 0) {
      orConditions.push({ categoryIds: { $in: matchingCategories.map((c) => c._id) } });
    }
    filter.$or = orConditions;
  }

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

export type ProductDetail = {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  concentration: string;
  categoryIds: string[];
  notes: { top: string[]; heart: string[]; base: string[] };
  highlights: string[];
  howToUse?: string;
  ingredients?: string;
  variants: {
    sku: string;
    sizeMl: number;
    price: number;
    compareAtPrice?: number;
    stock: number;
    isDefault?: boolean;
  }[];
  images: { publicId: string; alt: string }[];
  rating: { average: number; count: number };
  isBestseller: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  seo?: { metaTitle?: string; metaDescription?: string };
};

// Wrapped in `cache()` — the PDP's generateMetadata and the page component
// both need this by slug, and without memoization that's two identical
// round trips to Mongo for every single product page load.
export const getProductBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  await connectToDatabase();
  const product = await ProductModel.findOne({ slug, status: "active" }).lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
});

export async function getRelatedProducts(
  productId: string,
  categoryIds: string[],
  limit = 4,
): Promise<ProductCardData[]> {
  await connectToDatabase();
  const products = await ProductModel.find(
    { _id: { $ne: productId }, categoryIds: { $in: categoryIds }, status: "active" },
    CARD_PROJECTION,
  )
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

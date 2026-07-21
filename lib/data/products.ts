import { connectToDatabase } from "@/lib/db/connect";
import { ProductModel } from "@/models/Product";
import { SORT_OPTIONS, type SortOption } from "@/lib/product-sort";

export { SORT_OPTIONS, type SortOption };

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
    stock: number;
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

/** General-purpose "You May Also Like" pool — used by the cart drawer and checkout upsell. */
export async function getRecommendedProducts(limit = 8): Promise<ProductCardData[]> {
  await connectToDatabase();
  const products = await ProductModel.find({ status: "active" }, CARD_PROJECTION)
    .sort({ "rating.average": -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

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
    isBestseller,
    concentrations,
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = params;

  const filter: Record<string, unknown> = { status: "active" };
  if (categoryId) filter.categoryIds = categoryId;
  if (productIds) filter._id = { $in: productIds };
  if (isBestseller) filter.isBestseller = true;
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

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  await connectToDatabase();
  const product = await ProductModel.findOne({ slug, status: "active" }).lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
}

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

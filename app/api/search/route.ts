import { NextResponse } from "next/server";
import { getProductList } from "@/lib/data/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ products: [] });
  }

  const { products, total } = await getProductList({ query, pageSize: 6, sort: "newest" });
  return NextResponse.json({ products, total });
}

import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const contents = fs.readFileSync(envPath, "utf-8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

import { connectToDatabase } from "../lib/db/connect";
import { CategoryModel } from "../models/Category";
import { CollectionModel } from "../models/Collection";
import { ProductModel } from "../models/Product";
import { ReviewModel } from "../models/Review";
import { FAQModel } from "../models/FAQ";
import { AnnouncementModel } from "../models/Announcement";
import { CouponModel } from "../models/Coupon";
import mongoose from "mongoose";

async function seed() {
  await connectToDatabase();
  console.log("Connected to MongoDB. Clearing existing collections...");

  await Promise.all([
    CategoryModel.deleteMany({}),
    CollectionModel.deleteMany({}),
    ProductModel.deleteMany({}),
    ReviewModel.deleteMany({}),
    FAQModel.deleteMany({}),
    AnnouncementModel.deleteMany({}),
    CouponModel.deleteMany({}),
  ]);

  const categories = await CategoryModel.insertMany([
    { name: "For Her", slug: "for-her", order: 1 },
    { name: "For Him", slug: "for-him", order: 2 },
    { name: "Unisex", slug: "unisex", order: 3 },
    { name: "Gift Sets", slug: "gift-sets", order: 4 },
  ]);

  const catByName = Object.fromEntries(categories.map((c) => [c.slug, c._id]));

  const productSeedData = [
    {
      name: "Amber Reverie",
      slug: "amber-reverie",
      shortDescription: "A warm amber signature with a golden honeyed trail.",
      description:
        "Amber Reverie opens with glowing amber and toasted spice, settling into a soft, honeyed base that lingers for hours. Composed for those who want to be remembered in a room.",
      categoryIds: [catByName["for-her"], catByName["unisex"]],
      concentration: "EDP",
      notes: {
        top: ["Bergamot", "Pink Pepper"],
        heart: ["Amber", "Saffron"],
        base: ["Vanilla", "Sandalwood", "Musk"],
      },
      highlights: ["12+ hour longevity", "Skin-safe, dermatologically tested", "Hand-finished bottle"],
      howToUse:
        "Spray on pulse points — wrists, neck, and inner elbows — from a distance of 4-6 inches after showering for best longevity.",
      ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool, Coumarin.",
      variants: [
        { sku: "AMB-REV-50", sizeMl: 50, price: 2850, compareAtPrice: 3200, stock: 40, isDefault: true },
        { sku: "AMB-REV-100", sizeMl: 100, price: 4250, compareAtPrice: 4800, stock: 25 },
      ],
      images: [
        { publicId: "products/amber-reverie-1", alt: "Amber Reverie bottle on ivory backdrop", width: 1200, height: 1500 },
        { publicId: "products/amber-reverie-2", alt: "Amber Reverie bottle detail shot", width: 1200, height: 1500 },
      ],
      rating: { average: 4.6, count: 128 },
      isBestseller: true,
      status: "active",
    },
    {
      name: "Ochre Bloom",
      slug: "ochre-bloom",
      shortDescription: "Sunlit florals over a warm ochre-toned woody base.",
      description:
        "Ochre Bloom pairs bright florals with warm woods for a scent that feels like golden hour. Understated, elegant, and easy to wear daily.",
      categoryIds: [catByName["for-her"]],
      concentration: "EDT",
      notes: {
        top: ["Mandarin", "Neroli"],
        heart: ["Jasmine", "Orris"],
        base: ["Cedarwood", "Amberwood"],
      },
      highlights: ["Light, everyday wear", "Cruelty-free", "Recyclable packaging"],
      howToUse: "Ideal for daytime wear. Reapply after 6-8 hours for continued freshness.",
      ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Citral, Geraniol.",
      variants: [
        { sku: "OCH-BLM-50", sizeMl: 50, price: 2450, stock: 35, isDefault: true },
        { sku: "OCH-BLM-100", sizeMl: 100, price: 3650, stock: 20 },
      ],
      images: [
        { publicId: "products/ochre-bloom-1", alt: "Ochre Bloom bottle on ivory backdrop", width: 1200, height: 1500 },
      ],
      rating: { average: 4.4, count: 76 },
      isNewArrival: true,
      status: "active",
    },
    {
      name: "Velvet Saffron",
      slug: "velvet-saffron",
      shortDescription: "Spiced saffron wrapped in soft leather and musk.",
      description:
        "A bold, spiced composition built around saffron and leather accord, finished with a soft musk base. Designed for evenings that call for presence.",
      categoryIds: [catByName["for-him"], catByName["unisex"]],
      concentration: "EDP",
      notes: {
        top: ["Saffron", "Cardamom"],
        heart: ["Rose", "Leather Accord"],
        base: ["Musk", "Oud", "Amber"],
      },
      highlights: ["Long-lasting evening wear", "Rich, statement projection", "Refillable bottle design"],
      howToUse: "Best suited for evening wear. Apply sparingly — 2-3 sprays deliver full-day projection.",
      ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Benzyl Benzoate, Citronellol.",
      variants: [
        { sku: "VLV-SAF-50", sizeMl: 50, price: 3150, stock: 30, isDefault: true },
        { sku: "VLV-SAF-100", sizeMl: 100, price: 4750, compareAtPrice: 5200, stock: 18 },
      ],
      images: [
        { publicId: "products/velvet-saffron-1", alt: "Velvet Saffron bottle on ivory backdrop", width: 1200, height: 1500 },
      ],
      rating: { average: 4.8, count: 203 },
      isBestseller: true,
      status: "active",
    },
    {
      name: "Midnight Vetiver",
      slug: "midnight-vetiver",
      shortDescription: "Earthy vetiver and smoked woods for quiet confidence.",
      description:
        "Midnight Vetiver is a grounded, woody composition — smoky, earthy, and understated. A daily signature for those who prefer restraint over volume.",
      categoryIds: [catByName["for-him"]],
      concentration: "EDT",
      notes: {
        top: ["Grapefruit", "Black Pepper"],
        heart: ["Vetiver", "Patchouli"],
        base: ["Smoked Woods", "Tonka Bean"],
      },
      highlights: ["Office-appropriate projection", "10+ hour longevity", "Water-resistant travel cap"],
      howToUse: "Apply to clothing pulse points as well as skin for extended wear through the day.",
      ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Eugenol.",
      variants: [
        { sku: "MDN-VET-50", sizeMl: 50, price: 2650, stock: 42, isDefault: true },
        { sku: "MDN-VET-100", sizeMl: 100, price: 3950, stock: 27 },
      ],
      images: [
        { publicId: "products/midnight-vetiver-1", alt: "Midnight Vetiver bottle on ivory backdrop", width: 1200, height: 1500 },
      ],
      rating: { average: 4.5, count: 91 },
      status: "active",
    },
    {
      name: "Golden Oud",
      slug: "golden-oud",
      shortDescription: "A rich oud composition finished with warm amber gold.",
      description:
        "Golden Oud brings together deep oud and warm amber for a luxurious, enveloping scent built for special occasions and gifting.",
      categoryIds: [catByName["unisex"], catByName["gift-sets"]],
      concentration: "Parfum",
      notes: {
        top: ["Cinnamon", "Cardamom"],
        heart: ["Oud", "Rose"],
        base: ["Amber", "Sandalwood", "Vanilla"],
      },
      highlights: ["Highest concentration in the collection", "Presented in a gift-ready box", "16+ hour longevity"],
      howToUse: "A single spray is often enough given the high concentration — apply to one pulse point.",
      ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Cinnamal.",
      variants: [
        { sku: "GLD-OUD-50", sizeMl: 50, price: 4450, stock: 15, isDefault: true },
      ],
      images: [
        { publicId: "products/golden-oud-1", alt: "Golden Oud gift box and bottle", width: 1200, height: 1500 },
      ],
      rating: { average: 4.9, count: 54 },
      isLimitedEdition: true,
      status: "active",
    },
    {
      name: "Clay & Musk",
      slug: "clay-musk",
      shortDescription: "Warm clay accord layered over soft skin musk.",
      description:
        "Clay & Musk is a minimalist, skin-close scent built around a warm clay accord and soft musk — an easy, versatile everyday layer.",
      categoryIds: [catByName["unisex"]],
      concentration: "EDT",
      notes: {
        top: ["Fig Leaf", "Clary Sage"],
        heart: ["Clay Accord", "Iris"],
        base: ["White Musk", "Ambrette"],
      },
      highlights: ["Skin-close, subtle projection", "Unisex, all-day wearable", "Alcohol-light formula"],
      howToUse: "Layer with our body mist (coming soon) for extended wear.",
      ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Hexyl Cinnamal.",
      variants: [
        { sku: "CLY-MSK-50", sizeMl: 50, price: 2250, stock: 50, isDefault: true },
      ],
      images: [
        { publicId: "products/clay-musk-1", alt: "Clay & Musk bottle on ivory backdrop", width: 1200, height: 1500 },
      ],
      rating: { average: 4.3, count: 39 },
      isNewArrival: true,
      status: "active",
    },
  ];

  const products = await ProductModel.insertMany(
    productSeedData.map((product) => ({
      ...product,
      minPrice: Math.min(...product.variants.map((v) => v.price)),
    })),
  );

  const productBySlug = Object.fromEntries(products.map((p) => [p.slug, p._id]));

  await CollectionModel.create({
    name: "Bestsellers",
    slug: "bestsellers",
    description: "Our most-loved fragrances, chosen by returning customers.",
    productIds: [productBySlug["amber-reverie"], productBySlug["velvet-saffron"], productBySlug["golden-oud"]],
    isFeatured: true,
  });

  await ReviewModel.insertMany([
    {
      productId: productBySlug["amber-reverie"],
      name: "Ananya S.",
      rating: 5,
      title: "Compliments every time",
      body: "This has become my signature scent. Lasts the entire work day and into the evening.",
      isVerifiedPurchase: true,
      status: "approved",
    },
    {
      productId: productBySlug["velvet-saffron"],
      name: "Rohan K.",
      rating: 5,
      title: "Rich and long-lasting",
      body: "Perfect for evening events — two sprays and I'm set for hours.",
      isVerifiedPurchase: true,
      status: "approved",
    },
  ]);

  await FAQModel.insertMany([
    {
      question: "How long does a bottle typically last?",
      answer: "With 2-3 sprays per day, a 50ml bottle typically lasts 2-3 months.",
      category: "product",
      order: 1,
    },
    {
      question: "What's the difference between EDT, EDP, and Parfum?",
      answer:
        "The difference is fragrance oil concentration: EDT (5-15%) is lightest, EDP (15-20%) is richer and longer-lasting, and Parfum (20-30%) has the highest concentration and longevity.",
      category: "product",
      order: 2,
    },
    {
      question: "Do you ship across India?",
      answer: "Yes, we ship pan-India. Orders above ₹999 qualify for free standard shipping.",
      category: "shipping",
      order: 3,
    },
    {
      question: "What is your return policy?",
      answer: "Unopened products can be returned within 7 days of delivery for a full refund.",
      category: "shipping",
      order: 4,
    },
    {
      question: "Are your fragrances authentic and cruelty-free?",
      answer: "All fragrances are formulated in-house, dermatologically tested, and never tested on animals.",
      category: "general",
      order: 5,
    },
  ]);

  await AnnouncementModel.create({
    text: "Free shipping on all orders above ₹999",
    isActive: true,
    order: 1,
  });

  await CouponModel.create({
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrderValue: 1500,
    maxDiscount: 500,
    isActive: true,
  });

  console.log(`Seeded ${categories.length} categories, ${products.length} products, 1 collection.`);
  await mongoose.connection.close();
}

seed()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });

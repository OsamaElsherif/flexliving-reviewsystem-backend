import dotenv from "dotenv";
dotenv.config();

import fs from "node:fs/promises";
import path from "node:path";
import prisma from "../db/PrismaClient.ts";
import {
  normalizeMockupReview,
  toPrismaPropertyCreate,
  toPrismaReviewCreate,
} from "./reviewNormalizer.ts";
import type { MockupReview } from "../dto/reviews.t.ts";

async function seed() {
  try {
    const filePath = path.resolve(process.cwd(), "src", "mockupReviews.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const mockups: MockupReview[] = JSON.parse(raw);

    const normalized = mockups.map(normalizeMockupReview);

    // Clear existing data to avoid duplicates
    await prisma.reviewCategory.deleteMany();
    await prisma.review.deleteMany();
    await prisma.property.deleteMany();

    let createdCount = 0;

    for (const item of normalized) {
      const property = await prisma.property.create({
        data: {
          ...toPrismaPropertyCreate(item),
        }
      });

      await prisma.review.create({
        data: {
          ...toPrismaReviewCreate(item),
          property: { connect: { id: property.id } },
        },
      });

      createdCount += 1;
    }

    console.log(`Seeding completed. Created ${createdCount} reviews.`);
  } catch (e: any) {
    console.error("Seeding failed:", e?.message ?? e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
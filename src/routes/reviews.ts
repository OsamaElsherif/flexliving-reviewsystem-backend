import { Router } from "express";
import prisma from "../db/PrismaClient.ts";
import { normalizeMockupReview, toPrismaPropertyCreate, toPrismaReviewCreate } from "../services/reviewNormalizer.ts";
import fs from "node:fs/promises";
import path from "node:path";
import type { MockupReview } from "../dto/reviews.t.ts";
// loading the mockup ssed service

const router =  Router();

// GET /api/reviews/hostway
// using the hostway sandbox
// router.get("/hostway", async (req, res) => {});

// GET /api/reviews/hostway
// return the original mockup JSON as requested
router.get("/hostway", async (req, res) => {
  try {
    const filePath = path.resolve(process.cwd(), "src", "mockupReviews.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const mockups: MockupReview[] = JSON.parse(raw);
    res.json({ status: "success", result: mockups });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// PATCH /api/reviews/hostway/:id/approve
router.patch("/hostway/:id/approve", async (req, res) => {
  const id = Number(req.params.id);
  const { approve } = req.body;

  try {
    // Read mockup reviews
    const filePath = path.resolve(process.cwd(), "src", "mockupReviews.json");
    const raw = await fs.readFile(filePath, "utf-8");
    let mockups: MockupReview[] = JSON.parse(raw);

    // Find the mockup review by hostaway id
    const mockIndex = mockups.findIndex((m) => m.id === id);
    
    if (mockIndex === -1) {
      return res.status(404).json({ status: "error", message: "Mockup review not found" });
    }

    // Update status in mockup
    if (mockups[mockIndex]) {
      mockups[mockIndex].status = approve ? "published" : "pending";
    }

    // Write updated mockups back to file
    await fs.writeFile(filePath, JSON.stringify(mockups, null, 2), "utf-8");

    // Normalize without forcing status to "published" (respect incoming approve instead)
    const normalized = normalizeMockupReview(mockups[mockIndex]!);

    // Ensure property exists (match by listings)
    const listingsKey = normalized.property.listings;
    let property = await prisma.property.findFirst({ where: { listings: listingsKey } });
    if (!property) {
      property = await prisma.property.create({ data: toPrismaPropertyCreate(normalized) });
    }

    // Upsert review by hostawayId for this property
    const existing = await prisma.review.findFirst({
      where: { hostawayId: normalized.hostawayId, propertyId: property.id },
      include: { categories: true, property: true },
    });

    let result;
    if (existing) {
      result = await prisma.review.update({
        where: { id: existing.id },
        data: { approved: approve },
        include: { categories: true, property: true },
      });
    } else {
      result = await prisma.review.create({
        data: { ...toPrismaReviewCreate({ ...normalized, approved: approve }, property.id) },
        include: { categories: true, property: true },
      });
    }

    res.json({ status: "ok", data: result });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// GET /api/reviews/:id
// loading the reviews from the database (which is seeded with the mockup)
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  
  try {
    const mockup_review = await prisma.review.findUnique({
      where: {id: id},
      include: {
        property: true
      }
    });
  
    res.json({status: "ok", data: mockup_review});
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// PATCH /api/reviews/:id/approve
router.patch("/:id/approve", async (req, res) => {
  const id = Number(req.params.id);
  const { approve } = req.body;

  try {
    const updated_review = await prisma.review.update({
      where: { id: id },
      data: {
        approved: approve,
      },
      include: {
        property: true,
      },
    });

    res.json({ status: "ok", data: updated_review });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// POST /api/reviews/seed
// seeding the database from the mockup 
router.post("/seed", async (req, res) => {
  try {
    const filePath = path.resolve(process.cwd(), "src", "mockupReviews.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const mockups: MockupReview[] = JSON.parse(raw);

    const normalized = mockups.map(normalizeMockupReview);

    // Create properties first (simple approach: upsert by name)
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
    }

    res.json({ status: "ok", count: normalized.length });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

export default router;
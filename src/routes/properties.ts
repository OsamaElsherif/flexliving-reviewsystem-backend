import { Router } from "express";
import prisma from "../db/PrismaClient.ts";
// loading the mockup ssed service

const router = Router();

// GET /api/properties/
// public usage & Dashboard usage
router.get("/", async (req, res) => {
    try {
        const properties = await prisma.property.findMany({
            include: {
                reviews: {
                    where: { approved: true },
                    include: {
                        categories: true
                    },
                },
            }
        });

        const result = properties.map((property) => {
            const reviews = property.reviews;
            const rated = reviews.filter((review) => review.rating !== null);

            const average = rated.length > 0 ?
            Math.round(
                (rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length) * 10
            ) / 10 
            : null;

            return {
                id: property.id,
                name: property.name,
                address: property.address,
                averageRating: average,
                reviewCount: reviews.length
            };
        });

        res.json({status: "ok", data: result});
    } catch (e: any) {
        res.status(500).json({ status: "error", message: e.message });
    }
});

// GET /api/properties/:id
// public usage & Dashboard usage
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    
    try {
        const property = await prisma.property.findUnique({
            where: { id: id },
            include: {
                reviews: {
                    where: {
                        approved: true
                    },
                    include: {
                        categories: true,
                        
                    }
                },                
            }
        });
        
        
        res.json({status: "ok", data: property});
    } catch (e: any) {
        res.status(500).json({  status: "error", message: e.message });
    }
});

// GET /api/properties/:id/reviews
// Dashboard usage
router.get("/:id/reviews", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const reviews = await prisma.review.findMany({
            where: { propertyId: id },
            include: { categories: true },
            orderBy: { submittedAt: "desc" }
        });

        res.json({ status: "ok", data: reviews });
    } catch (e: any) {
        res.status(500).json({  status: "error", message: e.message });
    }
});

// POST /api/properites/seed
// seeding the database from the mockup 
router.post("/seed", async (req, res) => {});

export default router;
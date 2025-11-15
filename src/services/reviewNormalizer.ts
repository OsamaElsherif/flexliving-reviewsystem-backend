import type { Prisma } from "@prisma/client";
import type { MockupReview, NormalizedReview } from "../dto/reviews.t.ts";

// Convert a single mockup review item to the normalized shape
export function normalizeMockupReview(input: MockupReview): NormalizedReview {
  const categories = (input.reviewCategory ?? []).map((c) => ({
    name: c.category,
    rating: c.rating ?? null,
  }));

  return {
    hostawayId: input.id,
    channel: "hostaway",
    reviewType: input.type ?? undefined,
    rating: input.rating ?? null,
    publicReview: input.publicReview ?? null,
    guestName: input.guestName ?? null,
    submittedAt: input.submittedAt ? new Date(input.submittedAt) : null,
    approved: input.status === "published",
    rawJson: JSON.stringify(input),
    categories,
    property: {
      name: input.listingName,
      address: null,
      listings: input.listingName,
    },
  };
}

// Helpers to convert normalized data into Prisma create inputs
export function toPrismaPropertyCreate(
  normalized: NormalizedReview
): Prisma.PropertyCreateInput {
  return {
    name: normalized.property.name,
    address: normalized.property.address ?? null,
    listings: normalized.property.listings,
  };
}

export function toPrismaReviewCreate(
  normalized: NormalizedReview,
  propertyId?: number
): Prisma.ReviewCreateInput {
  const reviewCreate: Prisma.ReviewCreateInput = {
    hostawayId: normalized.hostawayId,
    channel: normalized.channel,
    reviewType: normalized.reviewType ?? null,
    rating: normalized.rating ?? null,
    publicReview: normalized.publicReview ?? null,
    guestName: normalized.guestName ?? null,
    submittedAt: normalized.submittedAt ?? null,
    approved: normalized.approved,
    rawJson: normalized.rawJson ?? null,
    categories: {
      create: normalized.categories.map((c) => ({
        name: c.name,
        rating: c.rating ?? null,
      })),
    },
  };

  if (propertyId) {
    reviewCreate.property = { connect: { id: propertyId } };
  }

  return reviewCreate;
}
// Mockup JSON types (as provided by mockupReviews.json)
export type MockupReviewCategory = {
  category: string;
  rating: number | null;
};

export type MockupReview = {
  id: number;
  type: "host-to-guest" | "guest-to-host" | string;
  status: "published" | "pending" | string;
  rating: number | null;
  publicReview: string;
  reviewCategory: MockupReviewCategory[];
  submittedAt: string; // e.g. "2020-08-21 22:45:14"
  guestName: string;
  listingName: string;
};

// Normalized application type aligned with Prisma schema
export type NormalizedReview = {
  hostawayId: number;
  channel: string; // e.g. "hostaway"
  reviewType?: string;
  rating?: number | null;
  publicReview?: string | null;
  guestName?: string | null;
  submittedAt?: Date | null;
  approved: boolean;
  rawJson?: string;
  categories: { name: string; rating?: number | null }[];
  property: { name: string; address?: string | null; listings: string };
};
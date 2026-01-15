import { Review } from "@/components/ReviewForm";

const STORAGE_KEY = "vasstra_reviews";

export function getStoredReviews(productId: number): Review[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const allReviews: Review[] = JSON.parse(stored);
    return allReviews.filter((r) => r.productId === productId);
  } catch {
    return [];
  }
}

export function saveReview(review: Review): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allReviews: Review[] = stored ? JSON.parse(stored) : [];
    allReviews.unshift(review);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
  } catch {
    console.error("Failed to save review");
  }
}

export function getAllReviews(): Review[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

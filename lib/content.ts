export interface ReviewRow {
  id: number; rating: number; title: string; body: string; showName: boolean; status: "PENDING" | "APPROVED" | "REJECTED"; reply: string | null; createdAt: string;
  product: { name: string; slug: string }; customer: { name: string | null; phone: string };
}
export interface GuideSection { title: string; text: string; table: string }
export interface SizeGuide { intro: string; sections: GuideSection[] }

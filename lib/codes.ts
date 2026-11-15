export interface LoginCodeRow {
  id: number; phone: string; name: string | null; createdAt: string; expiresAt: string;
  status: "WAITING" | "USED" | "EXPIRED" | "UNAVAILABLE";
}

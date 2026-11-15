export interface Me { id: number; name: string; email: string; role: "OWNER" | "STAFF"; mustChangePassword?: boolean }
export interface Stats {
  ordersToday: number; revenueToday: number; pendingOrders: number; newLeads: number; pendingCodes?: number;
  lowStock: { variantId: number; name: string; size: string; colour: string; stock: number }[];
}

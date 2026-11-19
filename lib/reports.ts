import type { AdminOrder } from "./orders";

export interface CustomerRow { phone: string; name: string; email: string | null; orders: number; spent: number; lastOrderAt: string; hasAccount: boolean }
export interface CustomerList { total: number; page: number; pageSize: number; customers: CustomerRow[] }
export interface CustomerDetail {
  phone: string; name: string; email: string | null;
  account: { joinedAt: string; addresses: { id: number; label: string; name: string; phone: string; county: string; area: string; details: string }[]; reviews: number; wishlist: number } | null;
  stats: { orders: number; paidOrders: number; spent: number };
  orders: AdminOrder[];
}

export interface SalesReport {
  from: string; to: string; days: number;
  totals: { revenue: number; orders: number; units: number; avgOrder: number; deliveryFees: number; discounts: number };
  daily: { date: string; revenue: number; orders: number }[];
  byMethod: { method: string; orders: number; revenue: number }[];
  byCounty: { county: string; orders: number; revenue: number }[];
  topProducts: { productId: number; name: string; units: number; revenue: number }[];
  outstanding: { count: number; value: number };
  cancelledPaid: { count: number; value: number };
}

export interface CategoryRow { id: number; name: string; slug: string; _count: { products: number } }

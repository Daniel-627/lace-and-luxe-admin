export interface OrderItem { id: number; productId: number; variantId: number; name: string; size: string; colour: string; price: number; qty: number }
export interface AdminOrder {
  id: number; reference: string; trackingToken: string; contactName: string; contactPhone: string; email: string | null;
  deliveryName: string; deliveryPhone: string; county: string; area: string; addressDetails: string;
  total: number; status: "PENDING" | "PAID" | "FAILED" | "EXPIRED"; method: string | null; mpesaReceipt: string | null;
  fulfilment: string; notes: string; createdAt: string; items: OrderItem[];
  subtotal: number; deliveryFee: number; deliveryServiceName: string; discountCode: string | null; discountAmount: number;
  payTiming: string; paymentClaim: string | null; payNote: string | null;
}
export interface LeadItem { variantId: number; name: string; size: string; colour: string; price: number; qty: number }
export interface AdminLead { id: number; reference: string; source: string; items: LeadItem[]; total: number; status: string; orderId: number | null; createdAt: string }

export const FULFILMENT: [string, string][] = [["NEW", "New"], ["PACKED", "Packed"], ["OUT_FOR_DELIVERY", "Out for delivery"], ["DELIVERED", "Delivered"], ["CANCELLED", "Cancelled"]];
export const PAYMENT: [string, string][] = [["PENDING", "Awaiting payment"], ["PAID", "Paid"], ["FAILED", "Payment failed"], ["EXPIRED", "Expired"]];
export const METHODS: [string, string][] = [["MPESA", "M-Pesa"], ["MPESA_MANUAL", "M-Pesa (till, paybill or Pochi)"], ["CASH", "Cash"], ["BANK", "Bank"], ["WHATSAPP", "WhatsApp / other"]];
export const label = (list: [string, string][], v: string) => list.find(([k]) => k === v)?.[1] ?? v;

/** What to show for an order's payment: pay on delivery and "check this code" matter more than the bare status. */
export function payBadge(o: Pick<AdminOrder, "status" | "payTiming" | "paymentClaim">): { text: string; tone: "ok" | "warn" | "bad" | "muted" } {
  if (o.status === "PAID") return { text: "Paid", tone: "ok" };
  if (o.status === "EXPIRED") return { text: "Expired", tone: "bad" };
  if (o.status === "FAILED") return { text: "Payment failed", tone: "bad" };
  if (o.payTiming === "ON_DELIVERY") return { text: "Pay on delivery", tone: "muted" };
  if (o.paymentClaim) return { text: "Check M-Pesa code", tone: "warn" };
  return { text: "Awaiting payment", tone: "warn" };
}

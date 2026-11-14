export interface OrderItem { id: number; productId: number; variantId: number; name: string; size: string; colour: string; price: number; qty: number }
export interface AdminOrder {
  id: number; reference: string; trackingToken: string; contactName: string; contactPhone: string; email: string | null;
  deliveryName: string; deliveryPhone: string; county: string; area: string; addressDetails: string;
  total: number; status: "PENDING" | "PAID" | "FAILED"; method: string | null; mpesaReceipt: string | null;
  fulfilment: string; notes: string; createdAt: string; items: OrderItem[];
}
export interface LeadItem { variantId: number; name: string; size: string; colour: string; price: number; qty: number }
export interface AdminLead { id: number; reference: string; source: string; items: LeadItem[]; total: number; status: string; orderId: number | null; createdAt: string }

export const FULFILMENT: [string, string][] = [["NEW", "New"], ["PACKED", "Packed"], ["OUT_FOR_DELIVERY", "Out for delivery"], ["DELIVERED", "Delivered"], ["CANCELLED", "Cancelled"]];
export const PAYMENT: [string, string][] = [["PENDING", "Awaiting payment"], ["PAID", "Paid"], ["FAILED", "Payment failed"]];
export const METHODS: [string, string][] = [["MPESA", "M-Pesa"], ["CASH", "Cash"], ["BANK", "Bank"], ["WHATSAPP", "WhatsApp / other"]];
export const label = (list: [string, string][], v: string) => list.find(([k]) => k === v)?.[1] ?? v;

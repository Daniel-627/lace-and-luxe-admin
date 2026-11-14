export interface StaffMember { id: number; email: string; name: string; role: "OWNER" | "STAFF"; active: boolean }
export interface AuditEntry { id: number; staffName: string; action: string; detail: string; createdAt: string }

const LABELS: Record<string, string> = {
  login: "signed in", "password.change": "changed their password",
  "product.create": "added a product", "product.update": "edited a product", "product.delete": "deleted a product",
  "category.create": "added a category", "order.update": "updated an order", "lead.update": "updated a WhatsApp lead", "lead.convert": "turned a lead into an order",
  "settings.update": "changed a setting", "staff.create": "added a staff account", "staff.update": "changed a staff account",
};
export const actionLabel = (a: string) => LABELS[a] ?? a;

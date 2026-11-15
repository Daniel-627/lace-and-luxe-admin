import { localPhone } from "./format";

export interface RateDTO { id?: number; county: string; area: string | null; fee: number; freeAbove: number | null; etaText: string | null }
export interface DeliveryServiceDTO { id: number; name: string; description: string; etaText: string; active: boolean; allowsCod: boolean; position: number; rates: RateDTO[] }
export interface PaymentAccountDTO { id: number; kind: "TILL" | "PAYBILL" | "POCHI"; displayName: string; number: string; accountNumber: string | null; useOrderRef: boolean; active: boolean; position: number }
export interface PaymentSettingsDTO { stk: boolean; cod: boolean; holdMinutes: number; accounts: PaymentAccountDTO[] }
export interface DiscountDTO { id: number; code: string; description: string; kind: "PERCENT" | "FIXED"; value: number; minSubtotal: number; startsAt: string | null; endsAt: string | null; maxUses: number | null; uses: number; active: boolean }

export const KIND_LABEL = { TILL: "Till number (Buy Goods)", PAYBILL: "Paybill", POCHI: "Pochi la Biashara" } as const;

/** How the customer will see this account when paying. */
export function describeAccount(a: Pick<PaymentAccountDTO, "kind" | "number" | "accountNumber" | "useOrderRef" | "displayName">): string {
  if (a.kind === "TILL") return `Till ${a.number} · ${a.displayName}`;
  if (a.kind === "PAYBILL") return `Paybill ${a.number}, account ${a.useOrderRef ? "(the order reference)" : a.accountNumber} · ${a.displayName}`;
  return `Pochi la Biashara ${localPhone(a.number)} · ${a.displayName}`;
}

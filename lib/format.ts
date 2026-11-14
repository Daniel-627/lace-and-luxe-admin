export const kes = (n: number) => `KES ${n.toLocaleString("en-US")}`;

const fmt = new Intl.DateTimeFormat("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "medium", timeStyle: "short" });
/** Date and time in Kenya time. */
export const when = (iso: string) => fmt.format(new Date(iso));

/** 254712345678 -> 0712 345 678 */
export const localPhone = (p: string) => (/^254\d{9}$/.test(p) ? `0${p.slice(3, 6)} ${p.slice(6, 9)} ${p.slice(9)}` : p);

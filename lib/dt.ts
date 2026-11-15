const pad = (n: number) => String(n).padStart(2, "0");
/** ISO time -> value for a datetime-local box (device time zone). */
export const toInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(+d) ? "" : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const fromInput = (v: string) => (v ? new Date(v).toISOString() : "");

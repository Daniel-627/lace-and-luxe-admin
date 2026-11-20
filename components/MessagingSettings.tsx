"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveMessagingConfig, sendTestMessage } from "../app/actions-messaging";
import { CHANNEL_KEYS, CHANNEL_LABEL, type CategoryInfo, type ChannelKey, type ChannelStatus, type MsgConfig } from "../lib/messaging";

const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";
const card = "space-y-3 rounded-2xl border border-champagne/40 bg-white/60 p-5";

export default function MessagingSettings({ initial, channels, categories }: { initial: MsgConfig; channels: Record<ChannelKey, ChannelStatus>; categories: CategoryInfo[] }) {
  const router = useRouter();
  const [cfg, setCfg] = useState<MsgConfig>(initial);
  const [order, setOrder] = useState<Record<string, ChannelKey[]>>(() => Object.fromEntries(categories.map((c) => { const on = initial.chains[c.key] ?? []; return [c.key, [...on, ...CHANNEL_KEYS.filter((k) => !on.includes(k))]]; })));
  const [tests, setTests] = useState<Record<string, string>>({});
  const [testMsg, setTestMsg] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const isOn = (cat: string, ch: ChannelKey) => (cfg.chains[cat] ?? []).includes(ch);
  const rebuild = (cat: string, ord: ChannelKey[], on: (c: ChannelKey) => boolean) => setCfg((c) => ({ ...c, chains: { ...c.chains, [cat]: ord.filter(on) } }));
  const move = (cat: string, i: number, d: number) => {
    const ord = [...order[cat]]; const j = i + d; if (j < 0 || j >= ord.length) return;
    [ord[i], ord[j]] = [ord[j], ord[i]];
    setOrder({ ...order, [cat]: ord }); rebuild(cat, ord, (c) => isOn(cat, c));
  };
  const toggle = (cat: string, ch: ChannelKey) => rebuild(cat, order[cat], (c) => (c === ch ? !isOn(cat, c) : isOn(cat, c)));
  const setStaff = (i: number, k: "name" | "phone" | "email", v: string) => setCfg({ ...cfg, staff: cfg.staff.map((s, j) => (j === i ? { ...s, [k]: v } : s)) });

  async function save() {
    setBusy(true); setMsg("");
    const r = await saveMessagingConfig(cfg);
    setBusy(false);
    setMsg(r.ok ? "Saved." : r.error ?? "Could not save");
    if (r.ok) router.refresh();
  }
  async function test(ch: ChannelKey) {
    setTestMsg((m) => ({ ...m, [ch]: "Sending…" }));
    const r = await sendTestMessage(ch, tests[ch] ?? "");
    setTestMsg((m) => ({ ...m, [ch]: r.ok ? "Sent. Check that it arrived." : r.error ?? "Could not send" }));
  }

  return (
    <div className="space-y-8">
      <section className={card}>
        <h2 className="font-serif text-2xl">Channels</h2>
        <p className="text-sm text-claret/70">A channel works once its details are added to the server. Until then it is skipped and the next one is tried.</p>
        {CHANNEL_KEYS.map((ch) => (
          <div key={ch} className="space-y-2 rounded-xl border border-champagne/40 bg-ivory/60 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={cfg.channels[ch]} onChange={(e) => setCfg({ ...cfg, channels: { ...cfg.channels, [ch]: e.target.checked } })} /> {CHANNEL_LABEL[ch]}</label>
              <span className={channels[ch].configured ? "" : "text-claret/60"}>{channels[ch].configured ? "✓ Set up on the server" : "Not set up yet"}</span>
            </div>
            {!channels[ch].configured && <p className="text-xs text-claret/70">{channels[ch].hint}</p>}
            {channels[ch].configured && (
              <div className="flex flex-wrap gap-2">
                <input className={`${box} max-w-xs`} placeholder={ch === "email" ? "Send a test to this email" : "Send a test to this phone"} value={tests[ch] ?? ""} onChange={(e) => setTests({ ...tests, [ch]: e.target.value })} />
                <button onClick={() => void test(ch)} className="rounded-full border border-claret px-4 text-sm">Send test</button>
                {testMsg[ch] && <span className="self-center text-xs">{testMsg[ch]}</span>}
              </div>
            )}
          </div>
        ))}
      </section>

      <section className={card}>
        <h2 className="font-serif text-2xl">Who we message</h2>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.customerMessages} onChange={(e) => setCfg({ ...cfg, customerMessages: e.target.checked })} /> Send customers updates about their orders (they never name the items)</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.staffAlerts} onChange={(e) => setCfg({ ...cfg, staffAlerts: e.target.checked })} /> Alert our team about new orders, payments to check and new leads</label>
        <p className="pt-2 text-sm font-medium">Our team</p>
        {cfg.staff.map((s, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[1fr_1fr_1.3fr_auto]">
            <input className={box} placeholder="Name" value={s.name} onChange={(e) => setStaff(i, "name", e.target.value)} />
            <input className={box} placeholder="Phone (07xx…)" value={s.phone} onChange={(e) => setStaff(i, "phone", e.target.value)} />
            <input className={box} placeholder="Email (optional)" value={s.email} onChange={(e) => setStaff(i, "email", e.target.value)} />
            <button onClick={() => setCfg({ ...cfg, staff: cfg.staff.filter((_, j) => j !== i) })} className="text-sm underline">Remove</button>
          </div>
        ))}
        {cfg.staff.length < 10 && <button onClick={() => setCfg({ ...cfg, staff: [...cfg.staff, { name: "", phone: "", email: "" }] })} className="rounded-full border border-claret px-5 py-2 text-sm">+ Add a person</button>}
      </section>

      <section className={card}>
        <h2 className="font-serif text-2xl">Which channel, and what comes next</h2>
        <p className="text-sm text-claret/70">For each message, we try the channels top to bottom and stop at the first that works. If none work, it tries again a few times, then waits on the Messages page for you to send by hand. Tick the ones to use and use the arrows to reorder.</p>
        <div className="max-w-xs"><label className="mb-1 block text-sm font-medium">WhatsApp template language code</label><input className={box} value={cfg.waLanguage} onChange={(e) => setCfg({ ...cfg, waLanguage: e.target.value })} /></div>
        {(["CUSTOMER", "STAFF"] as const).map((aud) => (
          <div key={aud} className="space-y-3">
            <p className="pt-2 text-xs uppercase tracking-[0.15em] text-claret/60">{aud === "CUSTOMER" ? "To customers" : "To our team"}</p>
            {categories.filter((c) => c.audience === aud).map((c) => (
              <div key={c.key} className="space-y-2 rounded-xl border border-champagne/40 bg-ivory/60 p-4 text-sm">
                <div><p className="font-medium">{c.label}</p><p className="text-xs text-claret/60">{c.description}</p></div>
                <div className="space-y-1">
                  {order[c.key].map((ch, i) => (
                    <div key={ch} className="flex items-center gap-3">
                      <span className="w-5 text-claret/50">{i + 1}.</span>
                      <label className="flex flex-1 items-center gap-2"><input type="checkbox" checked={isOn(c.key, ch)} onChange={() => toggle(c.key, ch)} /> {CHANNEL_LABEL[ch]}</label>
                      <button onClick={() => move(c.key, i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-full border border-claret/30 px-3 disabled:opacity-30">↑</button>
                      <button onClick={() => move(c.key, i, 1)} disabled={i === order[c.key].length - 1} aria-label="Move down" className="rounded-full border border-claret/30 px-3 disabled:opacity-30">↓</button>
                    </div>
                  ))}
                </div>
                {isOn(c.key, "whatsapp") && (
                  <div>
                    <label className="mb-1 block text-xs font-medium">WhatsApp template name{c.key === "CODE" ? " (required)" : " (optional)"}</label>
                    <input className={box} placeholder={c.key === "CODE" ? "e.g. signin_code" : "Leave empty to send plain text"} value={cfg.templates[c.key] ?? ""} onChange={(e) => setCfg({ ...cfg, templates: { ...cfg.templates, [c.key]: e.target.value } })} />
                    <p className="mt-1 text-xs text-claret/60">WhatsApp only lets us start a chat with an approved template. {c.key === "CODE"
                      ? <>For sign-in codes, create the template in Meta with the category <b>Authentication</b> and a <b>Copy code</b> button, then type its exact name here. Meta fills in the code itself, so there are no other variables to match.</>
                      : <>Its variables must be, in order: {c.params.map((p, i) => `{{${i + 1}}} ${p}`).join(", ")}.</>}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-2xl bg-claret p-4 text-ivory">
        <button onClick={() => void save()} disabled={busy} className="rounded-full bg-champagne px-8 py-2.5 text-sm text-claret disabled:opacity-50">{busy ? "Saving…" : "Save messaging settings"}</button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </div>
  );
}

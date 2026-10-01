"use client";

import React from "react";
import { ShoppingBag, Zap, Lock, Check } from "lucide-react";
import { useFetch, api, bustCache } from "@/lib/client";
import { playSound } from "@/lib/sounds";
import { useToast } from "@/components/Providers";
import { EmptyState, CardSkeleton } from "@/components/ui";

export default function ShopPage() {
  const { toast } = useToast();
  const { data, loading, reload } = useFetch("/api/shop");
  const [busy, setBusy] = React.useState<string | null>(null);

  const buy = async (item: any) => {
    playSound("click");
    setBusy(item.key);
    try {
      const res: any = await api("/api/shop", { method: "POST", body: JSON.stringify({ item: item.key }) });
      playSound("success");
      toast(`${item.name} unlocked! −${item.cost} XP`, "success");
      bustCache("/api/shop");
      bustCache("/api/stats");
      bustCache("/api/dashboard");
      reload();
    } catch (e: any) {
      playSound("error");
      toast(e.message, "error");
    } finally {
      setBusy(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="grid" style={{ gap: 20 }}>
        <CardSkeleton height={90} />
        <div className="grid grid-3"><CardSkeleton height={210} /><CardSkeleton height={210} /><CardSkeleton height={210} /></div>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className="grid" style={{ gap: 20 }}>
      {/* XP wallet */}
      <div className="card" style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)" }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
          <Zap size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 800, fontSize: 19 }}>
            {data?.xpAvailable ?? 0} XP <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)" }}>spendable</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{data?.xp ?? 0} earned lifetime · {data?.spent ?? 0} spent</div>
        </div>
        <div className="badge" style={{ fontSize: 12 }}>Earn XP: 1 per focus minute · 5 per revised topic</div>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="card">
          <EmptyState icon={<ShoppingBag size={26} />} title="Shop is empty" hint="Come back later — new drops incoming." />
        </div>
      ) : (
        <>
        {["Utility", "Unlocks", "Themes", "Profile", "Cosmetics"].map((cat) => {
          const catItems = items.filter((it: any) => (it.cat || "Cosmetics") === cat);
          if (!catItems.length) return null;
          return (
          <div key={cat} className="grid" style={{ gap: 12 }}>
            <h2 style={{ fontSize: 15.5, fontWeight: 800, marginTop: 6 }}>{cat}</h2>
            <div className="grid grid-3">
          {catItems.map((it: any) => (
            <div key={it.key} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
              {it.owned && (
                <div style={{ position: "absolute", top: 12, right: 12 }} className="badge" >
                  <Check size={11} style={{ marginRight: 4 }} /> Owned
                </div>
              )}
              <div style={{ fontSize: 34, lineHeight: 1 }}>{it.icon}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15.5 }}>{it.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, marginTop: 4 }}>{it.desc}</div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 800, fontSize: 12.5 }}>
                  <Zap size={11} style={{ display: "inline", marginRight: 4 }} />{it.cost} XP
                </span>
                {it.owned ? (
                  <button className="btn" disabled style={{ flex: 1, opacity: 0.6 }}><Lock size={14} /> Owned</button>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, fontWeight: 800 }}
                    disabled={busy === it.key || (data?.xpAvailable ?? 0) < it.cost}
                    onClick={() => buy(it)}
                  >
                    {busy === it.key ? "Buying..." : (data?.xpAvailable ?? 0) < it.cost ? "Not enough XP" : "Buy"}
                  </button>
                )}
              </div>
              {it.repeatable && !it.owned && (
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Can be bought multiple times</div>
              )}
            </div>
          ))}
            </div>
          </div>
          );
        })}
        </>
      )}
    </div>
  );
}

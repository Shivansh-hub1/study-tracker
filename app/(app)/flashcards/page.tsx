"use client";

import React, { useState } from "react";
import { Plus, Trash2, Layers, Play, RotateCcw } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { CardSkeleton, EmptyState, Modal } from "@/components/ui";
import { useToast } from "@/components/Providers";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsPage() {
  const { toast } = useToast();
  const { data: decksData, loading, reload: reloadDecks } = useFetch("/api/decks");
  const [deckId, setDeckId] = useState<number | null>(null);
  const { data: cardsData, reload: reloadCards } = useFetch(deckId ? `/api/cards?deck=${deckId}` : null);
  const [deckModal, setDeckModal] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [deckSubject, setDeckSubject] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [mode, setMode] = useState<"deck" | "review" | "done">("deck");
  const [order, setOrder] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [got, setGot] = useState(0);

  const decks = decksData?.decks || [];
  const deck = decks.find((d: any) => d.id === deckId);
  const cards = (cardsData?.cards || []).filter((c: any) => !deckId || c.deck_id === deckId);

  const addDeck = async () => {
    if (!deckName.trim()) return;
    try {
      const r = await api("/api/decks", { method: "POST", body: JSON.stringify({ name: deckName, subject: deckSubject }) });
      setDeckModal(false); setDeckName(""); setDeckSubject("");
      reloadDecks(); setDeckId(r.deck.id); setMode("deck");
      toast("Deck created", "success");
    } catch (e: any) { toast(e.message, "error"); }
  };

  const addCard = async () => {
    if (!deckId || !front.trim() || !back.trim()) return;
    try {
      await api("/api/cards", { method: "POST", body: JSON.stringify({ deck_id: deckId, front, back }) });
      setFront(""); setBack(""); reloadCards(); reloadDecks();
    } catch (e: any) { toast(e.message, "error"); }
  };

  const startReview = (onlyWrong: boolean) => {
    const pool = onlyWrong ? cards.filter((c: any) => wrongIds.includes(c.id)) : cards;
    if (pool.length === 0) return;
    setOrder(shuffle(pool.map((c: any) => c.id)));
    setIdx(0); setFlipped(false); setWrongIds([]); setGot(0);
    setMode("review");
  };

  const answer = async (ok: boolean) => {
    const id = order[idx];
    try { await api("/api/cards", { method: "PATCH", body: JSON.stringify({ id, result: ok ? "correct" : "wrong" }) }); } catch {}
    if (ok) setGot((g) => g + 1);
    else setWrongIds((w) => [...w, id]);
    if (idx + 1 >= order.length) { setMode("done"); reloadCards(); reloadDecks(); }
    else { setIdx(idx + 1); setFlipped(false); }
  };

  if (loading && !decksData) return <div className="grid"><CardSkeleton height={200} /></div>;

  const current = cards.find((c: any) => c.id === order[idx]);

  return (
    <div className="grid" style={{ gap: 20 }}>
      {mode === "review" && current ? (
        <div className="card" style={{ maxWidth: 620, margin: "0 auto", width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Card {idx + 1} of {order.length} · {got} right</div>
          <div onClick={() => setFlipped((f) => !f)} style={{ border: "1px solid var(--border)", borderRadius: 18, padding: "56px 24px", background: "var(--surface-2)", cursor: "pointer", minHeight: 200, display: "grid", placeItems: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{flipped ? current.back : current.front}</div>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", margin: "10px 0" }}>{flipped ? "Did you get it?" : "Tap card to flip"}</div>
          {flipped && (
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn btn-danger" onClick={() => answer(false)}>Wrong ✕</button>
              <button className="btn btn-primary" onClick={() => answer(true)}>Right ✓</button>
            </div>
          )}
          <button className="btn btn-sm btn-ghost" style={{ marginTop: 12 }} onClick={() => { setMode("deck"); reloadCards(); reloadDecks(); }}>End review</button>
        </div>
      ) : mode === "done" ? (
        <div className="card" style={{ maxWidth: 520, margin: "0 auto", width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Review done! 🎉</div>
          <div className="stat-num" style={{ margin: "8px 0" }}>{got}/{order.length}</div>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>{wrongIds.length === 0 ? "Flawless — nothing to retry." : `${wrongIds.length} card${wrongIds.length === 1 ? "" : "s"} to retry.`}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
            {wrongIds.length > 0 && <button className="btn" onClick={() => startReview(true)}><RotateCcw size={15} /> Retry wrong ({wrongIds.length})</button>}
            <button className="btn btn-primary" onClick={() => setMode("deck")}>Back to deck</button>
          </div>
        </div>
      ) : deckId && deck ? (
        <div className="grid" style={{ gap: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-sm" onClick={() => { setDeckId(null); reloadDecks(); }}>← All decks</button>
            <h3 style={{ fontSize: 16, flex: 1 }}>{deck.name} <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>· {cards.length} cards</span></h3>
            <button className="btn btn-primary btn-sm" disabled={cards.length === 0} onClick={() => startReview(false)}><Play size={14} /> Review</button>
          </div>
          <div className="card" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input className="input" style={{ flex: "1 1 200px" }} placeholder="Front (question)…" value={front} onChange={(e) => setFront(e.target.value)} />
            <input className="input" style={{ flex: "1 1 200px" }} placeholder="Back (answer)…" value={back} onChange={(e) => setBack(e.target.value)} />
            <button className="btn" onClick={addCard} disabled={!front.trim() || !back.trim()}><Plus size={15} /> Card</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cards.map((c: any) => (
              <div key={c.id} className="card" style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{c.front}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>{c.back}</div>
                </div>
                {(c.correct + c.wrong) > 0 && <span className="badge">{c.correct}✓ {c.wrong}✕</span>}
                <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={async () => { await api(`/api/cards?id=${c.id}`, { method: "DELETE" }); reloadCards(); }}><Trash2 size={14} /></button>
              </div>
            ))}
            {cards.length === 0 && <div className="card"><EmptyState icon={<Layers size={26} />} title="No cards yet" hint="Add your first card above, then hit Review." /></div>}
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" onClick={() => setDeckModal(true)}><Plus size={15} /> New deck</button>
          </div>
          {decks.length === 0 ? (
            <div className="card"><EmptyState icon={<Layers size={26} />} title="No decks yet" hint="Create a deck per subject, add cards, and review with flip + scoring." action={<button className="btn btn-primary" onClick={() => setDeckModal(true)}><Plus size={15} /> Create deck</button>} /></div>
          ) : (
            <div className="grid grid-3">
              {decks.map((d: any) => (
                <div key={d.id} className="card" style={{ cursor: "pointer" }} onClick={() => { setDeckId(d.id); setMode("deck"); }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{d.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{d.subject || "General"} · {d.cards} cards</div>
                    </div>
                    <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={async (e) => { e.stopPropagation(); if (confirm(`Delete "${d.name}" and its cards?`)) { await api(`/api/decks?id=${d.id}`, { method: "DELETE" }); reloadDecks(); } }}><Trash2 size={14} /></button>
                  </div>
                  {(d.tried || 0) > 0 && (
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>Accuracy {Math.round(((d.got || 0) / d.tried) * 100)}% over {d.tried} tries</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <Modal open={deckModal} onClose={() => setDeckModal(false)} title="New deck">
        <div className="field"><label className="label">Name</label><input className="input" value={deckName} onChange={(e) => setDeckName(e.target.value)} placeholder="e.g. Physics formulas" /></div>
        <div className="field"><label className="label">Subject (optional)</label><input className="input" value={deckSubject} onChange={(e) => setDeckSubject(e.target.value)} placeholder="Physics" /></div>
        <div className="modal-actions">
          <button className="btn" onClick={() => setDeckModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={addDeck} disabled={!deckName.trim()}>Create deck</button>
        </div>
      </Modal>
    </div>
  );
}

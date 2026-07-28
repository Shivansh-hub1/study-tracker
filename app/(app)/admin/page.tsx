"use client";

import React, { useMemo, useState } from "react";
import {
  Users, Eye, Pencil, Trash2, ShieldCheck, Clock, Activity, UserCheck,
  KeyRound, Search, BookOpen, Target, ListChecks,
} from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { fmtMinutes, timeAgo, prettyDate, prettyDT } from "@/lib/utils";
import { Modal, EmptyState, Spinner, Stat, CardSkeleton, Dot, FieldError } from "@/components/ui";
import { useToast } from "@/components/Providers";

export default function AdminPage() {
  const { toast } = useToast();
  const { data, loading, error, setData } = useFetch("/api/admin/users");
  const users = useMemo(() => data?.users || [], [data]);
  const [q, setQ] = useState("");

  const [viewUser, setViewUser] = useState<any | null>(null);
  const [viewData, setViewData] = useState<any | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [editUser, setEditUser] = useState<any | null>(null);
  const [eName, setEName] = useState("");
  const [eRole, setERole] = useState("user");
  const [ePass, setEPass] = useState("");
  const [eErr, setEErr] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const openView = async (u: any) => {
    setViewUser(u);
    setViewData(null);
    setViewLoading(true);
    try {
      setViewData(await api(`/api/admin/users/${u.id}`));
    } catch (e: any) {
      toast(e.message, "error");
      setViewUser(null);
    }
    setViewLoading(false);
  };

  const openEdit = (u: any) => {
    setEName(u.name);
    setERole(u.role);
    setEPass("");
    setEErr(null);
    setEditUser(u);
  };

  const saveEdit = async () => {
    setBusy(true);
    setEErr(null);
    const prev = users;
    const optimistic = users.map((x: any) => (x.id === editUser.id ? { ...x, name: eName || x.name, role: eRole } : x));
    setData({ users: optimistic } as any);
    try {
      const { user } = await api(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: eName, role: eRole, password: ePass || undefined }),
      });
      setData({ users: prev.map((x: any) => (x.id === editUser.id ? { ...x, ...user } : x)) } as any);
      toast("User updated", "success");
      setEditUser(null);
    } catch (e: any) {
      setData({ users: prev } as any);
      setEErr(e.message);
    }
    setBusy(false);
  };

  const remove = async () => {
    const u = confirmDel;
    setConfirmDel(null);
    const prev = users;
    setData({ users: users.filter((x: any) => x.id !== u.id) } as any);
    try {
      await api(`/api/admin/users/${u.id}`, { method: "DELETE" });
      toast(`${u.name} and all their data deleted`, "success");
    } catch (e: any) {
      setData({ users: prev } as any);
      toast(e.message, "error");
    }
  };

  if (error) {
    return (
      <div className="card">
        <EmptyState icon={<ShieldCheck size={26} />} title="Admins only" hint="Your account doesn't have permission to view the admin panel." />
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="grid">
        <div className="grid grid-4"><CardSkeleton height={46} /><CardSkeleton height={46} /><CardSkeleton height={46} /><CardSkeleton height={46} /></div>
        <CardSkeleton height={300} />
      </div>
    );
  }

  const filtered = users.filter((u: any) =>
    `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())
  );
  const totalSec = users.reduce((a: number, u: any) => a + (u.total_sec || 0), 0);
  const activeToday = users.filter((u: any) => u.last_active_at && Date.now() - new Date(u.last_active_at).getTime() < 86400000).length;
  const totalSessions = users.reduce((a: number, u: any) => a + (u.session_count || 0), 0);

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="grid grid-4">
        <Stat icon={<Users size={22} />} label="Total users" value={String(users.length)} accent="#6366f1" />
        <Stat icon={<UserCheck size={22} />} label="Active today" value={String(activeToday)} accent="#10b981" />
        <Stat icon={<ListChecks size={22} />} label="Total sessions" value={String(totalSessions)} accent="#f59e0b" />
        <Stat icon={<Activity size={22} />} label="Study time (all users)" value={fmtMinutes(Math.round(totalSec / 60))} accent="#ec4899" />
      </div>

      <div className="card card-pad-0">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", flexWrap: "wrap" }}>
          <h3 style={{ fontSize: 15, flex: 1 }}>All users</h3>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input className="input" style={{ paddingLeft: 30, width: 220 }} placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr><th>User</th><th>Role</th><th>Joined</th><th>Last active</th><th>Sessions</th><th>Study time</th><th style={{ width: 120 }}></th></tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                        background: u.role === "admin" ? "var(--accent-grad)" : "var(--surface-2)",
                        border: u.role === "admin" ? "none" : "1px solid var(--border)",
                        display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800,
                        color: u.role === "admin" ? "#fff" : "var(--muted)",
                        boxShadow: u.role === "admin" ? "var(--glow)" : "none",
                      }}>
                        {u.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {u.role === "admin" ? (
                      <span className="badge"><ShieldCheck size={11} /> Admin</span>
                    ) : (
                      <span className="badge" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>User</span>
                    )}
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 13, whiteSpace: "nowrap" }}>{prettyDate(u.created_at)}</td>
                  <td style={{ color: "var(--muted)", fontSize: 13, whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {u.last_active_at && Date.now() - new Date(u.last_active_at).getTime() < 15 * 60000 && (
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} title="Online now" />
                      )}
                      {timeAgo(u.last_active_at)}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{u.session_count}</td>
                  <td style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmtMinutes(Math.round((u.total_sec || 0) / 60))}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="iconbtn" style={{ width: 30, height: 30 }} title="View details" onClick={() => openView(u)}><Eye size={13} /></button>
                      <button className="iconbtn" style={{ width: 30, height: 30 }} title="Edit" onClick={() => openEdit(u)}><Pencil size={13} /></button>
                      <button className="iconbtn" style={{ width: 30, height: 30 }} title="Delete user" onClick={() => setConfirmDel(u)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No users match “{q}”.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- View modal ---------- */}
      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title={viewUser ? `${viewUser.name}` : ""} wide>
        {viewLoading || !viewData ? (
          <Spinner lg />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13.5 }}>
              <span><b>{viewData.totals.sessions}</b> <span style={{ color: "var(--muted)" }}>sessions</span></span>
              <span><b>{fmtMinutes(Math.round(viewData.totals.total_sec / 60))}</b> <span style={{ color: "var(--muted)" }}>total</span></span>
              <span><b>{viewData.subjects.length}</b> <span style={{ color: "var(--muted)" }}>subjects</span></span>
              <span><b>{viewData.goals.length}</b> <span style={{ color: "var(--muted)" }}>goals</span></span>
              <span style={{ color: "var(--muted)" }}><Clock size={12} style={{ verticalAlign: -2 }} /> last session: {timeAgo(viewData.totals.last_session)}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{viewData.user.email} · joined {prettyDate(viewData.user.created_at)}</div>
            {viewData.subjects.length > 0 && (
              <div>
                <div className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}><BookOpen size={13} /> Subjects</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {viewData.subjects.map((s: any) => (
                    <span key={s.id} className="badge" style={{ background: `${s.color}22`, color: s.color }}>
                      <Dot color={s.color} /> {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {viewData.goals.length > 0 && (
              <div>
                <div className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Target size={13} /> Goals</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
                  {viewData.goals.map((g: any) => <li key={g.id}>{g.title} <b style={{ color: "var(--text)" }}>({g.target})</b></li>)}
                </ul>
              </div>
            )}
            <div>
              <div className="label">Recent sessions</div>
              {viewData.recent.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--muted)" }}>No sessions yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {viewData.recent.map((s: any) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8 }}>
                      <Dot color={s.subject_color || "#64748b"} />
                      <span style={{ flex: 1, fontWeight: 600 }}>{s.subject_name || "Unassigned"}</span>
                      <span className="badge" style={{ textTransform: "capitalize" }}>{s.type}</span>
                      <b style={{ fontVariantNumeric: "tabular-nums" }}>{fmtMinutes(Math.round(s.duration_sec / 60))}</b>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>{prettyDT(s.started_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- Edit modal ---------- */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit ${editUser?.name ?? "user"}`}>
        <FieldError msg={eErr} />
        <div className="field">
          <label className="label">Name</label>
          <input className="input" value={eName} onChange={(e) => setEName(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Role</label>
          <select className="select" value={eRole} onChange={(e) => setERole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="field">
          <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}><KeyRound size={13} /> Reset password (leave blank to keep current)</label>
          <input className="input" type="text" minLength={6} value={ePass} onChange={(e) => setEPass(e.target.value)} placeholder="New password, min 6 characters" />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => setEditUser(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={saveEdit} disabled={busy || !eName.trim()}>Save changes</button>
        </div>
      </Modal>

      {/* ---------- Delete modal ---------- */}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete user?">
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
          <b style={{ color: "var(--text)" }}>{confirmDel?.name}</b> ({confirmDel?.email}) and <b>all of their data</b> — subjects, sessions, goals, timetables, settings — will be permanently deleted. This can't be undone.
        </p>
        <div className="modal-actions">
          <button className="btn" onClick={() => setConfirmDel(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={remove}><Trash2 size={15} /> Delete permanently</button>
        </div>
      </Modal>
    </div>
  );
}

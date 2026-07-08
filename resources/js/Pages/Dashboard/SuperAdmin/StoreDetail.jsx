import { useState } from "react";
import { router } from "@inertiajs/react";
import { IconArrowLeft, IconBuildingStore, IconCrown, IconClock, IconBan, IconPlayerPlay, IconPlus, IconReceipt2, IconHistory, IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import toast from "react-hot-toast";

export default function StoreDetail({ store, history, payments, plans, durationOptions }) {
    const [suspendTarget, setSuspendTarget] = useState(null);
    const [suspendReason, setSuspendReason] = useState("");
    const [activateTarget, setActivateTarget] = useState(null);
    const [activatePlanId, setActivatePlanId] = useState("");
    const [activateDuration, setActivateDuration] = useState(1);
    const [activateNotes, setActivateNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const isSuspended = store.suspend_reason && !store.is_active;
    const isGrace = store.is_in_grace_period;

    const statusLabel = { trial: "Trial", active: "Aktif", past_due: "Jatuh Tempo", cancelled: "Dibatalkan", expired: "Kadaluarsa" };
    const statusColor = { trial: "bg-amber-100 text-amber-700", active: "bg-emerald-100 text-emerald-700", past_due: "bg-rose-100 text-rose-700", cancelled: "bg-slate-100 text-slate-700", expired: "bg-rose-100 text-rose-700" };

    const historyActionLabel = {
        activated: "Diaktifkan", changed: "Paket Diubah", extended: "Diperpanjang",
        suspended: "Disuspend", resumed: "Diaktifkan Kembali", cancelled: "Dibatalkan",
        manual_activated: "Aktivasi Manual",
    };
    const historyActionColor = {
        activated: "text-emerald-600", changed: "text-primary-600", extended: "text-amber-600",
        suspended: "text-rose-600", resumed: "text-emerald-600", cancelled: "text-slate-500",
        manual_activated: "text-emerald-600",
    };

    const paymentStatusLabel = { pending: "Pending", paid: "Lunas", expired: "Kadaluarsa", failed: "Gagal", cancelled: "Dibatalkan" };
    const paymentStatusColor = { pending: "bg-amber-100 text-amber-700", paid: "bg-emerald-100 text-emerald-700", expired: "bg-slate-100 text-slate-600", failed: "bg-rose-100 text-rose-700", cancelled: "bg-slate-100 text-slate-600" };

    const formatPrice = (v) => v === 0 ? "Gratis" : `Rp ${Number(v).toLocaleString("id-ID")}`;
    const formatDate = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—";
    const formatDateTime = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

    const handleSuspend = () => {
        if (!suspendReason.trim()) return;
        router.post(route("super-admin.stores.suspend", store.id), { reason: suspendReason }, {
            onSuccess: () => { setSuspendTarget(null); setSuspendReason(""); toast.success("Toko disuspend!"); },
        });
    };

    const handleResume = () => {
        router.post(route("super-admin.stores.resume", store.id), {}, {
            onSuccess: () => toast.success("Toko diaktifkan kembali!"),
        });
    };

    const handleActivateManual = () => {
        if (!activatePlanId) return;
        router.post(route("super-admin.stores.activate-manual", store.id), {
            plan_id: activatePlanId, duration_months: activateDuration, notes: activateNotes,
        }, {
            onSuccess: () => { setActivateTarget(null); setActivatePlanId(""); setActivateNotes(""); toast.success("Langganan diaktifkan!"); },
        });
    };

    return (
        <div className="py-8 max-w-5xl mx-auto">
            {/* Back */}
            <a href={route("subscription.index")} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
                <IconArrowLeft size={16} /> Kembali ke Langganan
            </a>

            {/* Store Info Card */}
            <div className={`bg-white rounded-2xl border p-6 mb-6 ${isSuspended ? "border-rose-300" : isGrace ? "border-amber-300" : "border-slate-200"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <IconBuildingStore size={22} className="text-slate-400" />
                            {store.name}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">{store.email || "—"} {store.phone && `· ${store.phone}`}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Dibuat {formatDate(store.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isSuspended ? (
                            <button onClick={handleResume} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                                <IconPlayerPlay size={16} /> Aktifkan Kembali
                            </button>
                        ) : (
                            <button onClick={() => { setSuspendTarget(true); setSuspendReason(""); }} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600">
                                <IconBan size={16} /> Suspend
                            </button>
                        )}
                        <button onClick={() => setActivateTarget(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                            <IconPlus size={16} /> Aktivasi Manual
                        </button>
                    </div>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[store.subscription_status] || "bg-slate-100 text-slate-700"}`}>
                        {isSuspended ? "Suspend" : statusLabel[store.subscription_status]}
                    </span>
                    {store.plan_name && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                            <IconCrown size={12} /> {store.plan_name}
                        </span>
                    )}
                    {store.days_remaining !== null && !isSuspended && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${store.days_remaining > 0 ? "bg-slate-100 text-slate-600" : "bg-rose-100 text-rose-700"}`}>
                            <IconClock size={12} /> {store.days_remaining > 0 ? `${store.days_remaining} hari tersisa` : "Kadaluarsa"}
                        </span>
                    )}
                    {isGrace && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <IconAlertTriangle size={12} /> Masa Tenggang
                        </span>
                    )}
                    {isSuspended && store.suspend_reason && (
                        <span className="text-sm text-rose-600">Alasan: {store.suspend_reason}</span>
                    )}
                </div>
            </div>

            {/* Grid: Timeline + Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscription Timeline */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
                        <IconHistory size={18} className="text-slate-400" />
                        Riwayat Langganan
                    </h2>
                    {history.length === 0 ? (
                        <p className="text-sm text-slate-400">Belum ada riwayat.</p>
                    ) : (
                        <div className="space-y-0">
                            {history.map((h, i) => (
                                <div key={h.id} className={`relative pl-6 pb-4 ${i !== history.length - 1 ? "border-l-2 border-slate-100" : ""}`}>
                                    <div className={`absolute left-0 top-1 w-2 h-2 rounded-full -translate-x-1/2 ${h.action.includes("suspend") ? "bg-rose-400" : h.action.includes("resumed") || h.action.includes("activated") ? "bg-emerald-400" : "bg-primary-400"}`} />
                                    <div className="text-xs text-slate-400">{formatDateTime(h.created_at)}</div>
                                    <div className={`text-sm font-medium ${historyActionColor[h.action] || "text-slate-700"}`}>
                                        {historyActionLabel[h.action] || h.action}
                                    </div>
                                    {h.plan_name && <div className="text-xs text-slate-500">Paket: {h.plan_name}</div>}
                                    {h.reason && <div className="text-xs text-slate-400">{h.reason}</div>}
                                    {h.changed_by_name && <div className="text-xs text-slate-400">Oleh: {h.changed_by_name}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Payment History */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
                        <IconReceipt2 size={18} className="text-slate-400" />
                        Riwayat Pembayaran
                    </h2>
                    {payments.length === 0 ? (
                        <p className="text-sm text-slate-400">Belum ada pembayaran.</p>
                    ) : (
                        <div className="space-y-3">
                            {payments.map((p) => (
                                <div key={p.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3">
                                    <div>
                                        <div className="text-sm font-medium text-slate-900">{p.plan_name} ({p.duration_months} bln)</div>
                                        <div className="text-xs text-slate-400">{formatDateTime(p.paid_at || p.created_at)}</div>
                                        {p.notes && <div className="text-xs text-slate-500 mt-0.5">{p.notes}</div>}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-slate-900">{formatPrice(p.amount)}</div>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColor[p.status] || "bg-slate-100 text-slate-600"}`}>
                                            {paymentStatusLabel[p.status] || p.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Suspend Modal */}
            {suspendTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSuspendTarget(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Suspend {store.name}</h2>
                        <p className="text-sm text-slate-500 mb-4">Pemilik toko tidak dapat login setelah disuspend.</p>
                        <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none mb-4" placeholder="Alasan suspend..." />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setSuspendTarget(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                            <button onClick={handleSuspend} disabled={!suspendReason.trim()} className="px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">Suspend</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Activate Manual Modal */}
            {activateTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setActivateTarget(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Aktivasi Manual — {store.name}</h2>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Paket *</label>
                        <select value={activatePlanId} onChange={e => setActivatePlanId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none mb-3">
                            <option value="">Pilih paket...</option>
                            {plans.map(p => <option key={p.id} value={p.id}>{p.name} — {formatPrice(p.monthly_price)}/bln</option>)}
                        </select>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Durasi *</label>
                        <select value={activateDuration} onChange={e => setActivateDuration(parseInt(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none mb-3">
                            {Object.entries(durationOptions).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Catatan</label>
                        <textarea value={activateNotes} onChange={e => setActivateNotes(e.target.value)} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none mb-4" placeholder="No. referensi..." />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setActivateTarget(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                            <button onClick={handleActivateManual} disabled={!activatePlanId} className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50">Aktifkan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

StoreDetail.layout = (page) => <DashboardLayout children={page} />;

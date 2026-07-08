import { useState } from "react";
import { router } from "@inertiajs/react";
import { IconCheck, IconCrown, IconLoader2, IconFlame, IconStar, IconReceipt2, IconBuildingStore, IconRocket, IconAlertTriangle, IconPencil, IconBan, IconPlayerPlay, IconPlus, IconClock, IconEye, IconMail, IconBrandWhatsapp } from "@tabler/icons-react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import toast from "react-hot-toast";

export default function Subscription({ store, currentPlan, plans, isGlobalAdmin, allStores, subscriptionStats, adminContact }) {
    const [upgrading, setUpgrading] = useState(null);

    // Modals state
    const [suspendTarget, setSuspendTarget] = useState(null);
    const [suspendReason, setSuspendReason] = useState("");
    const [activateTarget, setActivateTarget] = useState(null);
    const [activatePlanId, setActivatePlanId] = useState("");
    const [activateDuration, setActivateDuration] = useState(1);
    const [activateNotes, setActivateNotes] = useState("");
    const [editingContact, setEditingContact] = useState(false);
    const [contactEmail, setContactEmail] = useState(adminContact?.email || "");
    const [contactWa, setContactWa] = useState(adminContact?.whatsapp || "");

    const handleSaveContact = () => {
        router.post(route("subscription.admin-contact"), { email: contactEmail, whatsapp: contactWa }, {
            onSuccess: () => { setEditingContact(false); toast.success("Kontak disimpan!"); },
        });
    };

    const handleUpgrade = (planId, isFree) => {
        if (isFree) {
            setUpgrading(planId);
            router.post(route("subscription.upgrade"), { plan_id: planId }, {
                onSuccess: () => { setUpgrading(null); toast.success("Paket berhasil diaktifkan!"); },
                onError: () => { setUpgrading(null); toast.error("Gagal mengaktifkan paket."); },
            });
        } else {
            router.visit(route("subscription.checkout", { plan_id: planId }));
        }
    };

    const handleExtendTrial = (storeId, days) => {
        router.post(route("super-admin.stores.extend-trial", storeId), { days },
            { onSuccess: () => toast.success("Trial diperpanjang!") });
    };

    const handleChangePlan = (storeId, planId) => {
        router.post(route("super-admin.stores.change-plan", storeId), { plan_id: planId },
            { onSuccess: () => toast.success("Paket diubah!") });
    };

    const handleToggleStatus = (storeId) => {
        router.post(route("super-admin.stores.toggle-status", storeId), {},
            { onSuccess: () => toast.success("Status toko diubah!") });
    };

    const handleSuspend = () => {
        if (!suspendTarget || !suspendReason.trim()) return;
        router.post(route("super-admin.stores.suspend", suspendTarget.id), { reason: suspendReason }, {
            onSuccess: () => { setSuspendTarget(null); setSuspendReason(""); toast.success("Toko disuspend!"); },
        });
    };

    const handleResume = (storeId) => {
        router.post(route("super-admin.stores.resume", storeId), {}, {
            onSuccess: () => toast.success("Toko diaktifkan kembali!"),
        });
    };

    const handleActivateManual = () => {
        if (!activateTarget || !activatePlanId) return;
        router.post(route("super-admin.stores.activate-manual", activateTarget.id), {
            plan_id: activatePlanId,
            duration_months: activateDuration,
            notes: activateNotes,
        }, {
            onSuccess: () => { setActivateTarget(null); setActivatePlanId(""); setActivateNotes(""); toast.success("Langganan diaktifkan!"); },
        });
    };

    const formatPrice = (amount) => {
        if (amount === 0) return "Gratis";
        return `Rp ${Number(amount).toLocaleString("id-ID")}`;
    };

    const statusLabel = {
        trial: "Trial", active: "Aktif", past_due: "Jatuh Tempo", cancelled: "Dibatalkan", expired: "Kadaluarsa",
    };
    const statusColor = {
        trial: "bg-amber-100 text-amber-700", active: "bg-emerald-100 text-emerald-700", past_due: "bg-rose-100 text-rose-700", cancelled: "bg-slate-100 text-slate-700", expired: "bg-rose-100 text-rose-700",
    };

    const durationLabels = { 1: "1 Bulan", 3: "3 Bulan", 6: "6 Bulan", 12: "12 Bulan" };

    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Langganan</h1>
                    <p className="text-slate-500 mt-1">
                        {isGlobalAdmin ? "Kelola langganan semua toko." : "Pilih paket yang sesuai dengan kebutuhan bisnis Anda."}
                    </p>
                </div>

            {/* Admin Contact (non-superadmin) */}
            {!isGlobalAdmin && adminContact && (
                <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-5 text-center">
                    <p className="text-sm text-slate-500">
                        Butuh bantuan? Hubungi admin kami:
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-2">
                        {adminContact.email && (
                            <a href={`mailto:${adminContact.email}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700">
                                <IconMail size={16} />
                                {adminContact.email}
                            </a>
                        )}
                        {adminContact.whatsapp && (
                            <a href={`https://wa.me/${adminContact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                                <IconBrandWhatsapp size={16} />
                                {adminContact.whatsapp}
                            </a>
                        )}
                    </div>
                </div>
            )}
                {isGlobalAdmin && (
                    <div className="flex items-center gap-2">
                        <a href={route("super-admin.plans")} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 border border-primary-300 rounded-lg px-3 py-2">
                            <IconPencil size={18} />
                            Kelola Paket
                        </a>
                        <a href={route("subscription.billing")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-300 rounded-lg px-3 py-2">
                            <IconReceipt2 size={18} />
                            Riwayat Pembayaran
                        </a>
                    </div>
                )}
                {store && !isGlobalAdmin && (
                    <a href={route("subscription.billing")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-300 rounded-lg px-3 py-2">
                        <IconReceipt2 size={18} />
                        Riwayat Pembayaran
                    </a>
                )}
            </div>

            {/* Current Status Card (non-superadmin) */}
            {store && !isGlobalAdmin && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">{store.name}</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[store.subscription_status]}`}>
                                    {statusLabel[store.subscription_status]}
                                </span>
                                {store.days_remaining > 0 && (
                                    <span className="text-sm text-slate-500">{store.days_remaining} hari tersisa</span>
                                )}
                            </div>
                        </div>
                        {currentPlan && (
                            <div className="flex items-center gap-2">
                                <IconCrown size={20} className="text-amber-500" />
                                <span className="font-medium text-slate-900">Paket {currentPlan.name}</span>
                            </div>
                        )}
                    </div>
                    {store.is_trial && store.days_remaining > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
                            <IconFlame size={18} />
                            <span>Masa trial Anda. Upgrade sekarang untuk mendapatkan semua fitur!</span>
                        </div>
                    )}
                </div>
            )}

            {/* Superadmin Store Management Panel */}
            {isGlobalAdmin && allStores && (
                <div className="mb-8">
                    {/* Admin Contact Settings */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
                        {editingContact ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <span className="text-sm font-medium text-slate-700 shrink-0">Kontak Admin:</span>
                                <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="Email" className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 w-full sm:w-auto" />
                                <input value={contactWa} onChange={e => setContactWa(e.target.value)} placeholder="WhatsApp (0877...)" className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 w-full sm:w-auto" />
                                <button onClick={handleSaveContact} className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600">Simpan</button>
                                <button onClick={() => setEditingContact(false)} className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">Batal</button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <span className="font-medium text-slate-700">Kontak Admin:</span>
                                    {adminContact?.email && <span className="flex items-center gap-1"><IconMail size={14} /> {adminContact.email}</span>}
                                    {adminContact?.whatsapp && <span className="flex items-center gap-1 text-emerald-600"><IconBrandWhatsapp size={14} /> {adminContact.whatsapp}</span>}
                                    {!adminContact?.email && !adminContact?.whatsapp && <span className="text-slate-400">Belum diatur</span>}
                                </div>
                                <button onClick={() => { setEditingContact(true); setContactEmail(adminContact?.email || ""); setContactWa(adminContact?.whatsapp || ""); }} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700">
                                    <IconPencil size={14} /> Edit
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: "Total Toko", value: subscriptionStats.total, icon: IconBuildingStore, color: "bg-primary-50 text-primary-700" },
                            { label: "Aktif", value: subscriptionStats.active, icon: IconRocket, color: "bg-emerald-50 text-emerald-700" },
                            { label: "Trial", value: subscriptionStats.trial, icon: IconFlame, color: "bg-amber-50 text-amber-700" },
                            { label: "Kadaluarsa", value: subscriptionStats.expired, icon: IconAlertTriangle, color: "bg-rose-50 text-rose-700" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                                    <stat.icon size={16} />
                                </div>
                                <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                                <div className="text-xs text-slate-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Stores Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Toko</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Paket</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                                        <th className="text-center py-3 px-4 font-medium text-slate-500">User</th>
                                        <th className="text-right py-3 px-4 font-medium text-slate-500">Sisa</th>
                                        <th className="text-center py-3 px-4 font-medium text-slate-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allStores.map((s) => {
                                        const isSuspended = s.suspend_reason && !s.is_active;
                                        const isGrace = s.is_in_grace_period;
                                        return (
                                            <tr key={s.id} className={`border-b border-slate-100 ${isSuspended ? "bg-rose-50" : isGrace ? "bg-amber-50" : ""}`}>
                                                <td className="py-2.5 px-4">
                                                    <a href={route("super-admin.stores.detail", s.id)} className="font-medium text-slate-900 hover:text-primary-600">
                                                        {s.name}
                                                    </a>
                                                    {isSuspended && (
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <span className="text-xs text-rose-500">Suspend</span>
                                                            {s.suspend_reason && (
                                                                <span className="text-xs text-rose-400 truncate max-w-[150px]" title={s.suspend_reason}>
                                                                    — {s.suspend_reason}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {isGrace && <span className="text-xs text-amber-500 block">Masa tenggang</span>}
                                                </td>
                                                <td className="py-2.5 px-4">
                                                    <select
                                                        value={s.plan_id || ""}
                                                        onChange={(e) => handleChangePlan(s.id, e.target.value)}
                                                        className="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white cursor-pointer min-w-[100px]"
                                                    >
                                                        <option value="" disabled>Pilih...</option>
                                                        {plans.map((p) => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-2.5 px-4">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[s.subscription_status] || "bg-slate-100 text-slate-700"}`}>
                                                        {isSuspended ? "Suspend" : statusLabel[s.subscription_status] || s.subscription_status}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-4 text-center text-slate-600">{s.users_count}</td>
                                                <td className="py-2.5 px-4 text-right">
                                                    <span className={`font-medium ${s.days_remaining > 30 ? "text-emerald-600" : s.days_remaining > 0 ? "text-amber-600" : "text-rose-600"}`}>
                                                        {isSuspended ? "—" : `${s.days_remaining}h`}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-4">
                                                    <div className="flex items-center justify-center gap-1 flex-wrap">
                                                        {!isSuspended && (
                                                            <>
                                                                <button onClick={() => handleExtendTrial(s.id, 7)} className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded hover:bg-primary-100" title="+7 hari">+7h</button>
                                                                <button onClick={() => handleExtendTrial(s.id, 30)} className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded hover:bg-primary-100" title="+30 hari">+30h</button>
                                                                <button onClick={() => setActivateTarget(s)} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100" title="Aktifkan Manual">
                                                                    <IconPlus size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {isSuspended ? (
                                                            <button onClick={() => handleResume(s.id)} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 flex items-center gap-0.5">
                                                                <IconPlayerPlay size={12} /> Aktifkan
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => { setSuspendTarget(s); setSuspendReason(""); }} className="px-2 py-1 text-xs bg-rose-50 text-rose-700 rounded hover:bg-rose-100" title="Suspend">
                                                                <IconBan size={14} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => window.open(route("super-admin.stores.detail", s.id))} className="px-2 py-1 text-xs bg-slate-50 text-slate-600 rounded hover:bg-slate-100" title="Detail">
                                                            <IconEye size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Modal */}
            {suspendTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSuspendTarget(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Suspend Toko</h2>
                        <p className="text-sm text-slate-500 mb-4">
                            <strong>{suspendTarget.name}</strong> akan dinonaktifkan. Pemilik toko tidak dapat login.
                        </p>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Alasan suspend *</label>
                        <textarea
                            value={suspendReason}
                            onChange={e => setSuspendReason(e.target.value)}
                            rows={3}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none mb-4"
                            placeholder="Contoh: Pembayaran tertunggak 3 bulan..."
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setSuspendTarget(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                            <button onClick={handleSuspend} disabled={!suspendReason.trim()} className="px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">
                                Suspend
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Activate Manual Modal */}
            {activateTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setActivateTarget(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Aktivasi Manual</h2>
                        <p className="text-sm text-slate-500 mb-4">
                            Aktifkan langganan untuk <strong>{activateTarget.name}</strong> secara manual (pembayaran offline).
                        </p>

                        <label className="block text-xs font-medium text-slate-500 mb-1">Paket *</label>
                        <select value={activatePlanId} onChange={e => setActivatePlanId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none mb-3">
                            <option value="">Pilih paket...</option>
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>{p.name} — {formatPrice(p.monthly_price)}/bln</option>
                            ))}
                        </select>

                        <label className="block text-xs font-medium text-slate-500 mb-1">Durasi *</label>
                        <select value={activateDuration} onChange={e => setActivateDuration(parseInt(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none mb-3">
                            {Object.entries(durationLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>

                        <label className="block text-xs font-medium text-slate-500 mb-1">Catatan (opsional)</label>
                        <textarea value={activateNotes} onChange={e => setActivateNotes(e.target.value)} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none mb-4" placeholder="No. referensi transfer..." />

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setActivateTarget(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                            <button onClick={handleActivateManual} disabled={!activatePlanId} className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50">
                                Aktifkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {isGlobalAdmin ? "Daftar Paket" : "Paket Tersedia"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => {
                    const isCurrent = currentPlan?.id === plan.id;
                    return (
                        <div key={plan.id} className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${plan.is_default ? "border-primary-400 shadow-lg shadow-primary-100/50" : isCurrent ? "border-emerald-400" : "border-slate-200"}`}>
                            {plan.is_default && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary-500 text-white">
                                        <IconStar size={12} /> Populer
                                    </span>
                                </div>
                            )}
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                                <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                            </div>
                            <div className="mb-4">
                                <span className="text-3xl font-extrabold text-slate-900">{formatPrice(plan.monthly_price)}</span>
                                {plan.monthly_price > 0 && <span className="text-sm text-slate-400">/bulan</span>}
                                {plan.yearly_price && plan.yearly_price > 0 && (
                                    <p className="text-xs text-emerald-600 font-medium mt-0.5">{formatPrice(plan.yearly_price)}/tahun (hemat)</p>
                                )}
                            </div>
                            <ul className="space-y-2.5 mb-6 flex-1">
                                {plan.features?.slice(0, 6).map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                        <IconCheck size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{featureLabel(feature)}</span>
                                    </li>
                                ))}
                                {plan.features?.length > 6 && (
                                    <li className="text-xs text-slate-400 pl-6">+{plan.features.length - 6} fitur lainnya</li>
                                )}
                            </ul>
                            {!isGlobalAdmin && (
                                <button onClick={() => handleUpgrade(plan.id, Number(plan.monthly_price) === 0)} disabled={isCurrent || upgrading === plan.id}
                                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${isCurrent ? "bg-emerald-50 text-emerald-700 cursor-default" : plan.is_default ? "bg-primary-500 text-white hover:bg-primary-600 shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                                    {upgrading === plan.id ? <IconLoader2 size={18} className="animate-spin mx-auto" /> : isCurrent ? "Paket Aktif" : Number(plan.monthly_price) === 0 ? "Gratis" : "Pilih Paket"}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

Subscription.layout = (page) => <DashboardLayout children={page} />;

function featureLabel(key) {
    const labels = {
        pos_transactions: "Transaksi POS", product_management: "Manajemen Produk", customer_management: "Manajemen Pelanggan",
        basic_reports: "Laporan Dasar", advanced_reports: "Laporan Lanjutan", inventory_management: "Manajemen Inventori",
        purchase_orders: "Purchase Order", stock_opname: "Stock Opname", sales_returns: "Retur Penjualan",
        loyalty_program: "Program Loyalitas", crm_automation: "Otomasi CRM", whatsapp_notifications: "Notifikasi WhatsApp",
        multi_warehouse: "Multi Gudang", stock_transfers: "Transfer Stok", composite_products: "Produk Komposit",
        price_lists: "Daftar Harga", batch_tracking: "Batch Tracking", api_access: "API Access",
        custom_integration: "Integrasi Kustom", white_label: "White Label", email_support: "Dukungan Email",
        priority_support: "Dukungan Prioritas", dedicated_support: "Dukungan Khusus",
    };
    return labels[key] || key;
}

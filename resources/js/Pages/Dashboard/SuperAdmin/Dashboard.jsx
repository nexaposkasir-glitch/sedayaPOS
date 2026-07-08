import DashboardLayout from "@/Layouts/DashboardLayout";
import { IconBuildingStore, IconFlame, IconRocket, IconAlertTriangle, IconUsers, IconCrown } from "@tabler/icons-react";

export default function SuperAdminDashboard({ stats, recentStores, recentPayments }) {
    const formatPrice = (amount) => `Rp ${Number(amount).toLocaleString("id-ID")}`;

    const cards = [
        { label: "Total Toko", value: stats.total_stores, icon: IconBuildingStore, color: "bg-primary-50 text-primary-700" },
        { label: "Aktif", value: stats.active_stores, icon: IconRocket, color: "bg-emerald-50 text-emerald-700" },
        { label: "Trial", value: stats.trial_stores, icon: IconFlame, color: "bg-amber-50 text-amber-700" },
        { label: "Kadaluarsa", value: stats.expired_stores, icon: IconAlertTriangle, color: "bg-rose-50 text-rose-700" },
        { label: "Total Pengguna", value: stats.total_users, icon: IconUsers, color: "bg-cyan-50 text-cyan-700" },
    ];

    const statusBadge = {
        trial: "bg-amber-100 text-amber-700",
        active: "bg-emerald-100 text-emerald-700",
        past_due: "bg-rose-100 text-rose-700",
        cancelled: "bg-slate-100 text-slate-700",
        expired: "bg-rose-100 text-rose-700",
    };

    return (
        <div className="py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500 mt-1">Pantau seluruh toko dan aktivitas platform.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                            <card.icon size={20} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{card.value}</div>
                        <div className="text-sm text-slate-500">{card.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Stores */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Toko Terbaru</h2>
                    {recentStores.length === 0 ? (
                        <p className="text-sm text-slate-500">Belum ada toko terdaftar.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left py-2 font-medium text-slate-500">Nama</th>
                                        <th className="text-left py-2 font-medium text-slate-500">Paket</th>
                                        <th className="text-left py-2 font-medium text-slate-500">Status</th>
                                        <th className="text-right py-2 font-medium text-slate-500">User</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentStores.map((store) => (
                                        <tr key={store.id} className="border-b border-slate-50">
                                            <td className="py-2.5 font-medium text-slate-900">{store.name}</td>
                                            <td className="py-2.5 text-slate-600">{store.plan_name}</td>
                                            <td className="py-2.5">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[store.subscription_status] || "bg-slate-100 text-slate-700"}`}>
                                                    {store.subscription_status}
                                                    {store.days_remaining > 0 && ` (${store.days_remaining}d)`}
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-right text-slate-600">{store.users_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Recent Payments */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Pembayaran Terbaru</h2>
                    {recentPayments.length === 0 ? (
                        <p className="text-sm text-slate-500">Belum ada pembayaran langganan.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left py-2 font-medium text-slate-500">Toko</th>
                                        <th className="text-left py-2 font-medium text-slate-500">Paket</th>
                                        <th className="text-right py-2 font-medium text-slate-500">Jumlah</th>
                                        <th className="text-right py-2 font-medium text-slate-500">Gateway</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPayments.map((payment) => (
                                        <tr key={payment.id} className="border-b border-slate-50">
                                            <td className="py-2.5 font-medium text-slate-900">{payment.store_name}</td>
                                            <td className="py-2.5 text-slate-600">{payment.plan_name}</td>
                                            <td className="py-2.5 text-right font-medium text-slate-900">{formatPrice(payment.amount)}</td>
                                            <td className="py-2.5 text-right text-slate-500">{payment.gateway}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

SuperAdminDashboard.layout = (page) => <DashboardLayout children={page} />;

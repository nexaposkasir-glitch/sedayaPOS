import { router } from "@inertiajs/react";
import { IconArrowLeft, IconReceipt2 } from "@tabler/icons-react";
import DashboardLayout from "@/Layouts/DashboardLayout";

export default function Billing({ store, payments, isGlobalAdmin }) {
    const formatPrice = (amount) => `Rp ${Number(amount).toLocaleString("id-ID")}`;
    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const statusBadge = {
        pending: "bg-yellow-100 text-yellow-700",
        paid: "bg-emerald-100 text-emerald-700",
        expired: "bg-slate-100 text-slate-700",
        failed: "bg-rose-100 text-rose-700",
        cancelled: "bg-slate-100 text-slate-700",
    };

    return (
        <div className="py-8 max-w-3xl mx-auto">
            {/* Back button */}
            <button
                onClick={() => router.visit(route("subscription.index"))}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
            >
                <IconArrowLeft size={18} />
                Kembali ke Paket
            </button>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Riwayat Pembayaran</h1>
            <p className="text-slate-500 mb-8">
                {isGlobalAdmin ? "Semua pembayaran langganan di platform." : `Semua pembayaran langganan untuk ${store.name}.`}
            </p>

            {payments.data.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                    <IconReceipt2 size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Belum ada riwayat pembayaran.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    {isGlobalAdmin && (
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Toko</th>
                                    )}
                                    <th className="text-left py-3 px-4 font-medium text-slate-500">Paket</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-500">Jumlah</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-500">Metode</th>
                                    <th className="text-right py-3 px-4 font-medium text-slate-500">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.data.map((payment) => (
                                    <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                        {isGlobalAdmin && (
                                            <td className="py-3 px-4 font-medium text-slate-900">
                                                {payment.store?.name ?? "-"}
                                            </td>
                                        )}
                                        <td className="py-3 px-4 font-medium text-slate-900">
                                            {payment.plan?.name ?? "-"}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-900">
                                            {formatPrice(payment.amount)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                                statusBadge[payment.status] || "bg-slate-100 text-slate-700"
                                            }`}>
                                                {payment.status === "paid" ? "Lunas" :
                                                 payment.status === "pending" ? "Menunggu" :
                                                 payment.status === "expired" ? "Kadaluarsa" :
                                                 payment.status === "failed" ? "Gagal" :
                                                 payment.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 capitalize">{payment.gateway}</td>
                                        <td className="py-3 px-4 text-right text-slate-500">
                                            {formatDate(payment.paid_at || payment.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {payments.links && payments.links.length > 3 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                            <div className="text-sm text-slate-500">
                                {payments.from} - {payments.to} dari {payments.total}
                            </div>
                            <div className="flex gap-1">
                                {payments.links.map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.visit(link.url, { preserveState: true, replace: true })}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                                            link.active ? "bg-primary-500 text-white" :
                                            !link.url ? "text-slate-300 cursor-default" :
                                            "text-slate-600 hover:bg-slate-100"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

Billing.layout = (page) => <DashboardLayout children={page} />;

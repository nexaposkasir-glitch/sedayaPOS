import { useState } from "react";
import { router } from "@inertiajs/react";
import { IconArrowLeft, IconCreditCard, IconLoader2 } from "@tabler/icons-react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import toast from "react-hot-toast";

export default function Checkout({ store, plan, gateways, currentPlan }) {
    const [selectedGateway, setSelectedGateway] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePay = () => {
        if (!selectedGateway) {
            toast.error("Pilih metode pembayaran terlebih dahulu.");
            return;
        }

        setLoading(true);
        router.post(
            route("subscription.pay"),
            {
                plan_id: plan.id,
                gateway: selectedGateway,
                duration: 1,
            },
            {
                onError: () => {
                    setLoading(false);
                    toast.error("Gagal membuat pembayaran. Silakan coba lagi.");
                },
            }
        );
    };

    const formatPrice = (amount) => {
        if (amount === 0) return "Gratis";
        return `Rp ${Number(amount).toLocaleString("id-ID")}`;
    };

    const isCurrent = currentPlan?.id === plan.id;

    return (
        <div className="py-8 max-w-2xl mx-auto">
            {/* Back button */}
            <button
                onClick={() => router.visit(route("subscription.index"))}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
            >
                <IconArrowLeft size={18} />
                Kembali ke Paket
            </button>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Checkout</h1>
            <p className="text-slate-500 mb-8">Konfirmasi pembayaran langganan Anda.</p>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Ringkasan Pesanan</h2>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Toko</span>
                        <span className="font-medium text-slate-900">{store.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Paket</span>
                        <span className="font-medium text-slate-900">{plan.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Durasi</span>
                        <span className="font-medium text-slate-900">1 Bulan</span>
                    </div>
                    <hr className="border-slate-100" />
                    <div className="flex justify-between">
                        <span className="font-semibold text-slate-900">Total</span>
                        <span className="font-bold text-lg text-slate-900">{formatPrice(plan.monthly_price)}</span>
                    </div>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Metode Pembayaran</h2>

                {gateways.length === 0 ? (
                    <div className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
                        Belum ada metode pembayaran yang dikonfigurasi. Silakan hubungi admin untuk mengaktifkan Midtrans atau Xendit.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {gateways.map((gateway) => (
                            <button
                                key={gateway.value}
                                onClick={() => setSelectedGateway(gateway.value)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                                    selectedGateway === gateway.value
                                        ? "border-primary-500 bg-primary-50"
                                        : "border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                <IconCreditCard
                                    size={24}
                                    className={selectedGateway === gateway.value ? "text-primary-600" : "text-slate-400"}
                                />
                                <div>
                                    <div className="font-medium text-slate-900">{gateway.label}</div>
                                    <div className="text-sm text-slate-500">{gateway.description}</div>
                                </div>
                                {selectedGateway === gateway.value && (
                                    <div className="ml-auto w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Pay Button */}
            <button
                onClick={handlePay}
                disabled={isCurrent || loading || gateways.length === 0}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    isCurrent
                        ? "bg-emerald-50 text-emerald-700 cursor-not-allowed"
                        : loading
                        ? "bg-slate-200 text-slate-500 cursor-wait"
                        : "bg-primary-500 text-white hover:bg-primary-600 shadow-sm"
                }`}
            >
                {loading ? (
                    <IconLoader2 size={20} className="animate-spin mx-auto" />
                ) : isCurrent ? (
                    "Paket Sedang Aktif"
                ) : (
                    "Bayar Sekarang"
                )}
            </button>
        </div>
    );
}

Checkout.layout = (page) => <DashboardLayout children={page} />;

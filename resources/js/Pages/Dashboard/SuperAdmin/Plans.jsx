import { useState } from "react";
import { router } from "@inertiajs/react";
import { IconPencil, IconX, IconCheck, IconLoader2 } from "@tabler/icons-react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import toast from "react-hot-toast";

export default function SuperAdminPlans({ plans }) {
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSave = (e, plan) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Parse features from comma-separated string
        const featuresStr = data.features || "";
        data.features = featuresStr.split(",").map((f) => f.trim()).filter(Boolean);

        // Parse limits
        data.limits = {
            max_products: parseInt(data.max_products) || null,
            max_users: parseInt(data.max_users) || null,
            max_transactions_per_month: parseInt(data.max_transactions_per_month) || null,
            max_stores: parseInt(data.max_stores) || null,
        };
        delete data.max_products;
        delete data.max_users;
        delete data.max_transactions_per_month;
        delete data.max_stores;

        data.is_active = data.is_active === "1";
        data.is_default = data.is_default === "1";

        setSaving(true);
        router.put(route("super-admin.plans.update", plan.id), data, {
            onSuccess: () => {
                setSaving(false);
                setEditingId(null);
                toast.success("Paket diperbarui!");
            },
            onError: () => {
                setSaving(false);
                toast.error("Gagal memperbarui paket.");
            },
        });
    };

    const formatPrice = (amount) => {
        if (amount == 0) return "Free";
        return `Rp ${Number(amount).toLocaleString("id-ID")}`;
    };

    return (
        <div className="py-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Kelola Paket</h1>
            <p className="text-slate-500 mb-8">Edit harga, fitur, dan limit setiap paket langganan.</p>

            <div className="space-y-6">
                {plans.map((plan) => (
                    <div key={plan.id} className={`bg-white rounded-2xl border p-6 ${plan.is_default ? "border-primary-400" : "border-slate-200"}`}>
                        {editingId === plan.id ? (
                            <form onSubmit={(e) => handleSave(e, plan)} className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-slate-900">Edit: {plan.name}</h2>
                                    <button type="button" onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">
                                        <IconX size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Nama</label>
                                        <input name="name" defaultValue={plan.name} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Deskripsi</label>
                                        <input name="description" defaultValue={plan.description} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Harga Bulanan (Rp)</label>
                                        <input name="monthly_price" type="number" defaultValue={plan.monthly_price} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Harga Tahunan (Rp, opsional)</label>
                                        <input name="yearly_price" type="number" defaultValue={plan.yearly_price || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Limit Produk</label>
                                        <input name="max_products" type="number" defaultValue={plan.limits?.max_products || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Kosong = unlimited" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Limit Pengguna</label>
                                        <input name="max_users" type="number" defaultValue={plan.limits?.max_users || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Kosong = unlimited" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Limit Transaksi/bulan</label>
                                        <input name="max_transactions_per_month" type="number" defaultValue={plan.limits?.max_transactions_per_month || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Kosong = unlimited" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Maks Cabang</label>
                                        <input name="max_stores" type="number" defaultValue={plan.limits?.max_stores || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Kosong = unlimited" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Urutan</label>
                                        <input name="sort_order" type="number" defaultValue={plan.sort_order || 0} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        Fitur (pisahkan dengan koma)
                                    </label>
                                    <textarea
                                        name="features"
                                        defaultValue={plan.features?.join(", ") || ""}
                                        rows={3}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                        placeholder="pos_transactions, basic_reports, ..."
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        {featureKeys().join(", ")}
                                    </p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="is_active" value="1" defaultChecked={plan.is_active} className="rounded border-slate-300" />
                                        <span className="text-sm text-slate-700">Aktif</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="is_default" value="1" defaultChecked={plan.is_default} className="rounded border-slate-300" />
                                        <span className="text-sm text-slate-700">Paket Default</span>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                                        Batal
                                    </button>
                                    <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2">
                                        {saving ? <IconLoader2 size={16} className="animate-spin" /> : <IconCheck size={16} />}
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">
                                            {plan.name}
                                            {plan.is_default && (
                                                <span className="ml-2 inline-flex px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700">Default</span>
                                            )}
                                            {!plan.is_active && (
                                                <span className="ml-2 inline-flex px-2 py-0.5 text-xs rounded-full bg-rose-100 text-rose-700">Nonaktif</span>
                                            )}
                                        </h2>
                                        {plan.description && <p className="text-sm text-slate-500 mt-1">{plan.description}</p>}
                                    </div>
                                    <button
                                        onClick={() => setEditingId(plan.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
                                    >
                                        <IconPencil size={16} />
                                        Edit
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-400">Bulanan</span>
                                        <p className="font-semibold text-slate-900">{formatPrice(plan.monthly_price)}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Tahunan</span>
                                        <p className="font-semibold text-slate-900">{plan.yearly_price ? formatPrice(plan.yearly_price) : "-"}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Limit Produk</span>
                                        <p className="font-semibold text-slate-900">{plan.limits?.max_products || "Unlimited"}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Limit User</span>
                                        <p className="font-semibold text-slate-900">{plan.limits?.max_users || "Unlimited"}</p>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <span className="text-xs text-slate-400">Fitur:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {plan.features?.map((f, i) => (
                                            <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">{f}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

SuperAdminPlans.layout = (page) => <DashboardLayout children={page} />;

function featureKeys() {
    return [
        "pos_transactions", "product_management", "customer_management",
        "basic_reports", "advanced_reports", "inventory_management",
        "purchase_orders", "stock_opname", "sales_returns",
        "loyalty_program", "crm_automation", "whatsapp_notifications",
        "multi_warehouse", "stock_transfers", "composite_products",
        "price_lists", "batch_tracking", "api_access",
        "custom_integration", "white_label", "email_support",
        "priority_support", "dedicated_support",
    ];
}

import { router } from "@inertiajs/react";
import { IconSearch, IconSelector } from "@tabler/icons-react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SuperAdminStores({ stores, plans, filters }) {
    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    };

    const statusBadge = {
        trial: "bg-amber-100 text-amber-700",
        active: "bg-emerald-100 text-emerald-700",
        past_due: "bg-rose-100 text-rose-700",
        cancelled: "bg-slate-100 text-slate-700",
        expired: "bg-rose-100 text-rose-700",
    };

    const statusLabel = { trial: "Trial", active: "Aktif", past_due: "Jatuh Tempo", cancelled: "Dibatalkan", expired: "Kadaluarsa" };

    const statuses = ["all", "active", "trial", "expired", "cancelled"];

    const handleFilter = (status) => {
        router.get(route("super-admin.stores"), { status, search: filters.search }, { preserveState: true, replace: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        router.get(route("super-admin.stores"), { status: filters.status, search: formData.get("search") }, { preserveState: true, replace: true });
    };

    const handleExtendTrial = (storeId, days) => {
        router.post(
            route("super-admin.stores.extend-trial", storeId),
            { days },
            { onSuccess: () => toast.success("Trial diperpanjang!") }
        );
    };

    const handleChangePlan = (storeId, planId) => {
        router.post(
            route("super-admin.stores.change-plan", storeId),
            { plan_id: planId },
            { onSuccess: () => toast.success("Paket diubah!") }
        );
    };

    const handleToggleStatus = (storeId) => {
        router.post(
            route("super-admin.stores.toggle-status", storeId),
            {},
            { onSuccess: () => toast.success("Status toko diubah!") }
        );
    };

    return (
        <div className="py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Daftar Toko</h1>
                <p className="text-slate-500 mt-1">Kelola semua toko yang terdaftar di platform.</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => handleFilter(s)}
                                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                                    filters.status === s ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {s === "all" ? "Semua" : statusLabel[s] || s}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Cari toko..."
                                className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-56"
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium">
                            Cari
                        </button>
                    </form>
                </div>
            </div>

            {/* Stores Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-slate-500">Nama Toko</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-500">Paket</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-500">User</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-500">Terdaftar</th>
                                <th className="text-right py-3 px-4 font-medium text-slate-500">Sisa Hari</th>
                                <th className="text-center py-3 px-4 font-medium text-slate-500 w-40">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-400">Tidak ada toko ditemukan.</td>
                                </tr>
                            ) : (
                                stores.data.map((store) => (
                                    <tr key={store.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                        <td className="py-3 px-4 font-medium text-slate-900">{store.name}</td>
                                        <td className="py-3 px-4 text-slate-600">{store.plan?.name ?? "-"}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[store.subscription_status] || "bg-slate-100 text-slate-700"}`}>
                                                {statusLabel[store.subscription_status] || store.subscription_status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">{store.users_count}</td>
                                        <td className="py-3 px-4 text-slate-500">{formatDate(store.created_at)}</td>
                                        <td className="py-3 px-4 text-right">
                                            <span className={`font-medium ${
                                                store.days_remaining > 30 ? "text-emerald-600" :
                                                store.days_remaining > 0 ? "text-amber-600" :
                                                "text-rose-600"
                                            }`}>
                                                {store.days_remaining} hari
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* Extend Trial */}
                                                {store.subscription_status === 'trial' && (
                                                    <button
                                                        onClick={() => handleExtendTrial(store.id, 7)}
                                                        className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded hover:bg-primary-100"
                                                        title="Perpanjang trial 7 hari"
                                                    >
                                                        +7h
                                                    </button>
                                                )}
                                                {/* Change Plan Dropdown */}
                                                <select
                                                    onChange={(e) => e.target.value && handleChangePlan(store.id, e.target.value)}
                                                    className="px-2 py-1 text-xs border border-slate-300 rounded bg-white cursor-pointer"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Ubah</option>
                                                    {plans.map((plan) => (
                                                        <option key={plan.id} value={plan.id}>
                                                            {plan.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {/* Toggle Status */}
                                                <button
                                                    onClick={() => handleToggleStatus(store.id)}
                                                    className={`px-2 py-1 text-xs rounded ${
                                                        store.is_active
                                                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                                                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                    }`}
                                                    title={store.is_active ? "Nonaktifkan" : "Aktifkan"}
                                                >
                                                    {store.is_active ? "Off" : "On"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {stores.links && stores.links.length > 3 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                        <div className="text-sm text-slate-500">
                            Menampilkan {stores.from} - {stores.to} dari {stores.total}
                        </div>
                        <div className="flex gap-1">
                            {stores.links.map((link, i) => (
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
        </div>
    );
}

SuperAdminStores.layout = (page) => <DashboardLayout children={page} />;

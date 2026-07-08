import React, { useState } from "react";
import { Head, usePage, useForm, Link } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    IconUserPlus,
    IconDeviceFloppy,
    IconArrowLeft,
    IconShield,
    IconBuildingStore,
    IconCrown,
} from "@tabler/icons-react";
import Input from "@/Components/Dashboard/Input";
import Checkbox from "@/Components/Dashboard/Checkbox";
import toast from "react-hot-toast";

export default function Create() {
    const { roles, stores, plans, isGlobalAdmin } = usePage().props;

    const { data, setData, post, errors, processing } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        selectedRoles: isGlobalAdmin ? ["admin"] : [],
        avatar: null,
        store_id: "",
        new_store_name: "",
        plan_id: "",
    });

    const [avatarPreview, setAvatarPreview] = useState(null);

    const setSelectedRoles = (e) => {
        let items = [...data.selectedRoles];
        if (items.includes(e.target.value)) {
            items = items.filter((name) => name !== e.target.value);
        } else {
            items.push(e.target.value);
        }
        setData("selectedRoles", items);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("users.store"), {
            onSuccess: () => toast.success("Pengguna berhasil ditambahkan"),
            onError: () => toast.error("Gagal menyimpan pengguna"),
        });
    };

    return (
        <>
            <Head title="Tambah Pengguna" />

            <div className="mb-6">
                <Link
                    href={route("users.index")}
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-3"
                >
                    <IconArrowLeft size={16} />
                    Kembali ke Pengguna
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconUserPlus size={28} className="text-primary-500" />
                    {isGlobalAdmin
                        ? "Daftarkan Klien Baru"
                        : "Tambah Pengguna Baru"}
                </h1>
                {isGlobalAdmin && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Daftarkan pemilik toko baru beserta paket langganannya.
                        User akan menjadi admin toko tersebut.
                    </p>
                )}
            </div>

            <form onSubmit={submit}>
                <div className="max-w-2xl space-y-6">
                    {/* Toko & Paket — only for superadmin */}
                    {isGlobalAdmin && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                <IconBuildingStore size={16} />
                                Toko & Langganan
                            </h3>
                            <div className="space-y-4">
                                {/* Store selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Pilih Toko
                                    </label>
                                    <select
                                        value={data.store_id}
                                        onChange={(e) => {
                                            setData("store_id", e.target.value);
                                            if (e.target.value !== "new") {
                                                setData("new_store_name", "");
                                            }
                                        }}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 ${
                                            errors.store_id
                                                ? "border-danger-500"
                                                : "border-slate-300 dark:border-slate-600"
                                        } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                                    >
                                        <option value="">
                                            -- Pilih Toko --
                                        </option>
                                        {stores.map((store) => (
                                            <option
                                                key={store.id}
                                                value={store.id}
                                            >
                                                {store.name}
                                            </option>
                                        ))}
                                        <option value="new">
                                            + Buat Toko Baru
                                        </option>
                                    </select>
                                    {errors.store_id && (
                                        <p className="text-xs text-danger-500 mt-1">
                                            {errors.store_id}
                                        </p>
                                    )}
                                </div>

                                {/* New store name — conditional */}
                                {data.store_id === "new" && (
                                    <Input
                                        type="text"
                                        label="Nama Toko Baru"
                                        placeholder="Masukkan nama toko"
                                        value={data.new_store_name}
                                        onChange={(e) =>
                                            setData(
                                                "new_store_name",
                                                e.target.value
                                            )
                                        }
                                        errors={errors.new_store_name}
                                    />
                                )}

                                {/* Plan selection */}
                                {data.store_id && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                            <IconCrown size={16} />
                                            Paket Langganan
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {plans.map((plan) => (
                                                <label
                                                    key={plan.id}
                                                    className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                                                        data.plan_id ===
                                                        String(plan.id)
                                                            ? "border-primary-500 bg-primary-50 dark:bg-primary-950/50"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-primary-300"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="plan_id"
                                                        value={plan.id}
                                                        checked={
                                                            data.plan_id ===
                                                            String(plan.id)
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "plan_id",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="mt-0.5 text-primary-500 focus:ring-primary-500"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                            {plan.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5">
                                                            {plan.monthly_price >
                                                            0
                                                                ? `Rp ${Number(
                                                                      plan.monthly_price
                                                                  ).toLocaleString(
                                                                      "id-ID"
                                                                  )}/bulan`
                                                                : "Gratis"}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.plan_id && (
                                            <p className="text-xs text-danger-500 mt-1">
                                                {errors.plan_id}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Account Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                            Informasi Akun
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Avatar
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center text-slate-600 font-semibold">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>
                                                {data.name
                                                    ? data.name
                                                          .charAt(0)
                                                          .toUpperCase()
                                                    : "?"}
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setData("avatar", file);
                                                setAvatarPreview(
                                                    URL.createObjectURL(file)
                                                );
                                            }
                                        }}
                                        errors={errors.avatar}
                                    />
                                </div>
                            </div>
                            <Input
                                type="text"
                                label="Nama Lengkap"
                                placeholder="Masukkan nama"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                errors={errors.name}
                            />
                            <Input
                                type="email"
                                label="Email"
                                placeholder="email@example.com"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                errors={errors.email}
                            />
                            <Input
                                type="password"
                                label="Kata Sandi"
                                placeholder="Minimal 8 karakter"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                errors={errors.password}
                            />
                            <Input
                                type="password"
                                label="Konfirmasi Kata Sandi"
                                placeholder="Ulangi kata sandi"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        "password_confirmation",
                                        e.target.value
                                    )
                                }
                                errors={errors.password_confirmation}
                            />
                        </div>
                    </div>

                    {/* Roles — only for non-global-admin (e.g. admin adding employees) */}
                    {!isGlobalAdmin && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                <IconShield size={16} />
                                Akses Group
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {roles.map((role, i) => (
                                    <label
                                        key={i}
                                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                                            data.selectedRoles.includes(role.name)
                                                ? "border-primary-500 bg-primary-50 dark:bg-primary-950/50"
                                                : "border-slate-200 dark:border-slate-700 hover:border-primary-300"
                                        }`}
                                    >
                                        <Checkbox
                                            value={role.name}
                                            onChange={setSelectedRoles}
                                            checked={data.selectedRoles.includes(
                                                role.name
                                            )}
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                                            {role.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.selectedRoles && (
                                <p className="text-xs text-danger-500 mt-3">
                                    {errors.selectedRoles}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <Link
                            href={route("users.index")}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"
                        >
                            <IconDeviceFloppy size={18} />
                            {processing ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;

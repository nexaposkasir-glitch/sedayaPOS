import { useEffect, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthBotGuardFields from "@/Components/AuthBotGuardFields";
import {
    IconUser,
    IconMail,
    IconLock,
    IconEye,
    IconEyeOff,
    IconLoader2,
    IconArrowRight,
    IconCheck,
    IconBuildingStore,
} from "@tabler/icons-react";

export default function Register({ botGuard }) {
    const honeypotField = botGuard?.honeypot_field || "company_website";
    const tokenField = botGuard?.token_field || "bot_guard_token";
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        store_name: "",
        email: "",
        password: "",
        password_confirmation: "",
        [honeypotField]: "",
        [tokenField]: botGuard?.token || "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        return () => reset("password", "password_confirmation");
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("register"));
    };

    return (
        <>
            <Head title="Daftar — SedayaPOS" />

            <div className="min-h-screen flex flex-col bg-slate-50">
                {/* Top bar */}
                <div className="w-full border-b border-slate-100 bg-white px-4 sm:px-6 py-3.5">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2.5"
                        >
                            <img src="/images/logo-sedaya.png" alt="SedayaPOS" className="h-8 w-auto" />
                            <span className="text-lg font-bold text-slate-900 tracking-tight">
                                Sedaya
                                <span className="text-primary-500">POS</span>
                            </span>
                        </Link>
                        <Link
                            href="/login"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Sudah punya akun?
                        </Link>
                    </div>
                </div>

                {/* Centered card */}
                <div className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
                    <div className="w-full max-w-[440px]">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <img src="/images/logo-sedaya.png" alt="SedayaPOS" className="h-16 w-auto mx-auto mb-5" />
                            <h1 className="text-2xl font-bold text-slate-900">
                                Buat Akun Baru
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Mulai trial 30 hari gratis, tanpa kartu kredit
                            </p>
                        </div>

                        {/* Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                            {/* Form */}
                            <form onSubmit={submit} className="space-y-4">
                                <AuthBotGuardFields
                                    botGuard={botGuard}
                                    data={data}
                                    setData={setData}
                                />
                                {errors.human && (
                                    <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-100">
                                        {errors.human}
                                    </div>
                                )}

                                {/* Nama */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Nama Lengkap
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <IconUser size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData(
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Nama Anda"
                                            autoFocus
                                            className={`w-full h-11 pl-10 pr-4 rounded-lg border ${
                                                errors.name
                                                    ? "border-rose-300 bg-rose-50/30"
                                                    : "border-slate-200"
                                            } bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all text-sm outline-none`}
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-rose-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Nama Toko */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Nama Toko <span className="text-slate-400 font-normal">(opsional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <IconBuildingStore size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.store_name}
                                            onChange={(e) =>
                                                setData(
                                                    "store_name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Nama toko Anda"
                                            className={`w-full h-11 pl-10 pr-4 rounded-lg border ${
                                                errors.store_name
                                                    ? "border-rose-300 bg-rose-50/30"
                                                    : "border-slate-200"
                                            } bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all text-sm outline-none`}
                                        />
                                    </div>
                                    {errors.store_name && (
                                        <p className="mt-1 text-xs text-rose-500">
                                            {errors.store_name}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <IconMail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData(
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="nama@email.com"
                                            className={`w-full h-11 pl-10 pr-4 rounded-lg border ${
                                                errors.email
                                                    ? "border-rose-300 bg-rose-50/30"
                                                    : "border-slate-200"
                                            } bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all text-sm outline-none`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-rose-500">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <IconLock size={18} />
                                        </div>
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Minimal 8 karakter"
                                            className={`w-full h-11 pl-10 pr-11 rounded-lg border ${
                                                errors.password
                                                    ? "border-rose-300 bg-rose-50/30"
                                                    : "border-slate-200"
                                            } bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all text-sm outline-none`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <IconEyeOff size={18} />
                                            ) : (
                                                <IconEye size={18} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-xs text-rose-500">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Konfirmasi Password */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Konfirmasi Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <IconLock size={18} />
                                        </div>
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    "password_confirmation",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ulangi password"
                                            className={`w-full h-11 pl-10 pr-11 rounded-lg border ${
                                                errors.password_confirmation
                                                    ? "border-rose-300 bg-rose-50/30"
                                                    : "border-slate-200"
                                            } bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all text-sm outline-none`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? (
                                                <IconEyeOff size={18} />
                                            ) : (
                                                <IconEye size={18} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-xs text-rose-500">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {processing ? (
                                        <>
                                            <IconLoader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Daftar Sekarang
                                            <IconArrowRight size={16} />
                                        </>
                                    )}
                                </button>

                                {/* Trial badge */}
                                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg py-2 px-3 border border-emerald-100">
                                    <IconCheck size={14} stroke={3} />
                                    Trial 30 hari gratis &bull; Tanpa kartu
                                    kredit
                                </div>
                            </form>
                        </div>

                        {/* Footer link */}
                        <p className="mt-6 text-center text-sm text-slate-500">
                            Sudah punya akun?{" "}
                            <Link
                                href="/login"
                                className="text-slate-900 font-semibold hover:text-primary-500 transition-colors"
                            >
                                Masuk disini
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Bottom subtle */}
                <div className="text-center pb-6">
                    <p className="text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} Malino_Seduh
                    </p>
                </div>
            </div>
        </>
    );
}

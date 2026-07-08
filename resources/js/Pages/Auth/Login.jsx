import { useEffect, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthBotGuardFields from "@/Components/AuthBotGuardFields";
import {
    IconMail,
    IconLock,
    IconEye,
    IconEyeOff,
    IconLoader2,
    IconArrowRight,
} from "@tabler/icons-react";

export default function Login({
    status,
    canResetPassword,
    canRegister,
    botGuard,
}) {
    const honeypotField = botGuard?.honeypot_field || "company_website";
    const tokenField = botGuard?.token_field || "bot_guard_token";
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
        [honeypotField]: "",
        [tokenField]: botGuard?.token || "",
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => reset("password");
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <>
            <Head title="Masuk — SedayaPOS" />

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
                        {canRegister && (
                            <Link
                                href="/register"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Belum punya akun?
                            </Link>
                        )}
                    </div>
                </div>

                {/* Centered card */}
                <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
                    <div className="w-full max-w-[400px]">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <img src="/images/logo-sedaya.png" alt="SedayaPOS" className="h-16 w-auto mx-auto mb-5" />
                            <h1 className="text-2xl font-bold text-slate-900">
                                Selamat Datang Kembali
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Masuk ke dashboard SedayaPOS
                            </p>
                        </div>

                        {/* Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                            {/* Status */}
                            {status && (
                                <div className="mb-5 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-100">
                                    {status}
                                </div>
                            )}

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
                                            autoFocus
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
                                            placeholder="Password Anda"
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

                                {/* Remember + Forgot */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData(
                                                    "remember",
                                                    e.target.checked
                                                )
                                            }
                                            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                                        />
                                        <span className="text-sm text-slate-500">
                                            Ingat saya
                                        </span>
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route("password.request")}
                                            className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
                                        >
                                            Lupa password?
                                        </Link>
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
                                            Masuk ke Dashboard
                                            <IconArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Footer link */}
                        {canRegister && (
                            <p className="mt-6 text-center text-sm text-slate-500">
                                Belum punya akun?{" "}
                                <Link
                                    href="/register"
                                    className="text-slate-900 font-semibold hover:text-primary-500 transition-colors"
                                >
                                    Daftar Gratis
                                </Link>
                            </p>
                        )}
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

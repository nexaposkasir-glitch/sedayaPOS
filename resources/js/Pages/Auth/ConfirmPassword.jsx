import { useEffect, useMemo, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    IconLock,
    IconEye,
    IconEyeOff,
    IconLoader2,
} from "@tabler/icons-react";

export default function ConfirmPassword({ challenge = null }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => reset("password");
    }, []);

    const challengeLabel = useMemo(() => {
        if (!challenge?.route) return "aksi sensitif";
        return challenge.route.replaceAll(".", " / ");
    }, [challenge]);

    const submit = (e) => {
        e.preventDefault();
        post(route("password.confirm"));
    };

    return (
        <>
            <Head title="Konfirmasi Password — SedayaPOS" />

            <div className="min-h-screen flex flex-col bg-slate-50">
                {/* Top bar */}
                <div className="w-full border-b border-slate-100 bg-white px-4 sm:px-6 py-3.5">
                    <div className="max-w-7xl mx-auto">
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
                    </div>
                </div>

                {/* Centered card */}
                <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
                    <div className="w-full max-w-[400px]">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <img src="/images/logo-sedaya.png" alt="SedayaPOS" className="h-16 w-auto mx-auto mb-5" />
                            <h1 className="text-2xl font-bold text-slate-900">
                                Konfirmasi Password
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Untuk melanjutkan {challengeLabel}, masukkan kembali
                                password Anda
                            </p>
                        </div>

                        {/* Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                            <form onSubmit={submit} className="space-y-4">
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
                                            placeholder="Masukkan password Anda"
                                            autoFocus
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

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                                >
                                    {processing ? (
                                        <>
                                            <IconLoader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                            Memverifikasi...
                                        </>
                                    ) : (
                                        "Lanjutkan"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

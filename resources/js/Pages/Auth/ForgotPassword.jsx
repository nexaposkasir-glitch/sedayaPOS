import { Head, Link, useForm } from "@inertiajs/react";
import {
    IconMail,
    IconLoader2,
    IconArrowLeft,
} from "@tabler/icons-react";
import AuthBotGuardFields from "@/Components/AuthBotGuardFields";

export default function ForgotPassword({ status, botGuard }) {
    const honeypotField = botGuard?.honeypot_field || "company_website";
    const tokenField = botGuard?.token_field || "bot_guard_token";
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        [honeypotField]: "",
        [tokenField]: botGuard?.token || "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <>
            <Head title="Lupa Password — SedayaPOS" />

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
                                Lupa Password?
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Masukkan email Anda, kami akan kirim link reset
                                password
                            </p>
                        </div>

                        {/* Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                            {status && (
                                <div className="mb-5 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-100">
                                    <div className="flex items-start gap-2">
                                        <IconMail size={16} className="mt-0.5 flex-shrink-0" />
                                        <span>{status}</span>
                                    </div>
                                </div>
                            )}

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
                                            className={`w-full h-11 pl-10 pr-4 rounded-lg border ${
                                                errors.email
                                                    ? "border-rose-300 bg-rose-50/30"
                                                    : "border-slate-200"
                                            } bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all text-sm outline-none`}
                                            placeholder="nama@email.com"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-rose-500">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <Link
                                        href={route("login")}
                                        className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        <IconArrowLeft size={16} />
                                        Kembali
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex h-11 flex-[2] items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <IconLoader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                                Mengirim...
                                            </>
                                        ) : (
                                            "Kirim Link Reset"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

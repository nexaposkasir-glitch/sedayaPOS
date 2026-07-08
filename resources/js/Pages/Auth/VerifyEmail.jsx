import { Head, Link, useForm } from "@inertiajs/react";
import AuthBotGuardFields from "@/Components/AuthBotGuardFields";
import {
    IconMailCheck,
    IconLoader2,
    IconLogout,
    IconRefresh,
} from "@tabler/icons-react";

export default function VerifyEmail({ status, botGuard }) {
    const honeypotField = botGuard?.honeypot_field || "company_website";
    const tokenField = botGuard?.token_field || "bot_guard_token";
    const { data, setData, post, processing, errors } = useForm({
        [honeypotField]: "",
        [tokenField]: botGuard?.token || "",
    });

    const submit = (event) => {
        event.preventDefault();
        post(route("verification.send"));
    };

    return (
        <>
            <Head title="Verifikasi Email — SedayaPOS" />

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
                    <div className="w-full max-w-[420px]">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <img src="/images/logo-sedaya.png" alt="SedayaPOS" className="h-16 w-auto mx-auto mb-5" />
                            <h1 className="text-2xl font-bold text-slate-900">
                                Verifikasi Email Anda
                            </h1>
                            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                Kami sudah kirim link verifikasi ke email Anda.
                                Klik link tersebut untuk mengaktifkan akun.
                            </p>
                        </div>

                        {/* Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                            {status === "verification-link-sent" && (
                                <div className="mb-5 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-100">
                                    <div className="flex items-start gap-2">
                                        <IconMailCheck
                                            size={16}
                                            className="mt-0.5 flex-shrink-0"
                                        />
                                        <span>
                                            Link verifikasi baru sudah dikirim ke
                                            email Anda.
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="mb-5 rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-700">
                                Periksa juga folder <strong>spam</strong> atau{" "}
                                <strong>promotion</strong> jika email belum
                                terlihat di inbox.
                            </div>

                            {errors.human && (
                                <div className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-100">
                                    {errors.human}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-3">
                                <AuthBotGuardFields
                                    botGuard={botGuard}
                                    data={data}
                                    setData={setData}
                                />
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
                                            Mengirim ulang...
                                        </>
                                    ) : (
                                        <>
                                            <IconRefresh size={16} />
                                            Kirim Ulang Email Verifikasi
                                        </>
                                    )}
                                </button>

                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="w-full h-11 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <IconLogout size={16} />
                                    Keluar
                                </Link>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

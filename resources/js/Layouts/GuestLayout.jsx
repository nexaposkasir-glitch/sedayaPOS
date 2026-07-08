import { Link } from "@inertiajs/react";

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Top bar */}
            <div className="w-full border-b border-slate-100 bg-white px-4 sm:px-6 py-3.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2.5">
                        <img src="/images/logo-sedaya.png" alt="SedayaPOS" className="h-8 w-auto" />
                        <span className="text-lg font-bold text-slate-900 tracking-tight">
                            Sedaya<span className="text-primary-500">POS</span>
                        </span>
                    </Link>
                </div>
            </div>

            {/* Centered content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}

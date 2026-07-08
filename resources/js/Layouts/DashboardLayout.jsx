import React, { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import Sidebar from "@/Components/Dashboard/Sidebar";
import Navbar from "@/Components/Dashboard/Navbar";
import { Toaster } from "react-hot-toast";
import { useTheme } from "@/Context/ThemeSwitcherContext";
import { IconArrowBack } from "@tabler/icons-react";

export default function AppLayout({ children }) {
    const { darkMode, themeSwitcher } = useTheme();
    const { auth, security, store, isImpersonating } = usePage().props;
    const planUsage = store?.planUsage ?? [];

    const getInitialSidebarState = () => {
        if (typeof window === "undefined") return false;
        const stored = localStorage.getItem("sidebarOpen");
        if (stored !== null) return stored === "true";
        return window.innerWidth >= 768;
    };

    const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebarState);
    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );

    useEffect(() => {
        localStorage.setItem("sidebarOpen", sidebarOpen);
    }, [sidebarOpen]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const securityWarnings = security?.warnings ?? [];
    const showSecurityWarnings =
        auth?.super === true && securityWarnings.length > 0;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors duration-200">
            <Sidebar sidebarOpen={sidebarOpen} />
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 bg-slate-900/40 md:hidden transition-opacity duration-300 ${
                    sidebarOpen ? "opacity-100 pointer-events-auto z-30" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setSidebarOpen(false)}
            />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Navbar
                    toggleSidebar={toggleSidebar}
                    themeSwitcher={themeSwitcher}
                    darkMode={darkMode}
                />
                <main className="dashboard-scrollbar flex-1 overflow-y-auto">
                    <div className="w-full py-6 px-4 md:px-6 lg:px-8 pb-20 md:pb-6">
                        {showSecurityWarnings && (
                            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                                <p className="text-sm font-semibold">
                                    Production security baseline warning
                                </p>
                                <ul className="mt-2 space-y-1 text-sm">
                                    {securityWarnings.map((warning) => (
                                        <li key={warning.key}>
                                            - {warning.message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {isImpersonating && (
                            <div className="mb-6 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-primary-800 dark:border-primary-800 dark:bg-primary-950/30 dark:text-primary-200 flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    Anda login sebagai <strong>{auth.user.name}</strong>
                                </p>
                                <form onSubmit={(e) => { e.preventDefault(); router.post(route("users.impersonate.stop")); }}>
                                    <button type="submit" className="flex items-center gap-1.5 text-xs bg-primary-500 text-white px-3 py-1.5 rounded-lg hover:bg-primary-600 transition-colors">
                                        <IconArrowBack size={14} /> Kembali ke Superadmin
                                    </button>
                                </form>
                            </div>
                        )}
                        {planUsage.length > 0 && planUsage.some((u) => u.isNearLimit) && (
                            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                    Penggunaan Paket
                                </p>
                                <div className="space-y-2">
                                    {planUsage.map((item) => (
                                        <div key={item.key} className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500 w-20 shrink-0">{item.label}</span>
                                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        item.isReachedLimit
                                                            ? "bg-rose-500"
                                                            : item.isNearLimit
                                                            ? "bg-amber-500"
                                                            : "bg-primary-500"
                                                    }`}
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-medium w-16 text-right ${
                                                item.isReachedLimit ? "text-rose-600" : "text-slate-500"
                                            }`}>
                                                {item.current}/{item.limit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {planUsage.some((u) => u.isReachedLimit) && (
                                    <a
                                        href={route("subscription.index")}
                                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                                    >
                                        Upgrade paket untuk meningkatkan limit
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        )}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                className: "text-sm",
                                duration: 3000,
                                style: {
                                    background: darkMode ? "#1e293b" : "#fff",
                                    color: darkMode ? "#f1f5f9" : "#1e293b",
                                    border: `1px solid ${
                                        darkMode ? "#334155" : "#e2e8f0"
                                    }`,
                                    borderRadius: "12px",
                                },
                            }}
                        />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { IconMenu2, IconMoon, IconSun, IconSearch, IconBuildingStore, IconSwitchHorizontal } from "@tabler/icons-react";
import AuthDropdown from "@/Components/Dashboard/AuthDropdown";
import Menu from "@/Utils/Menu";
import Notification from "@/Components/Dashboard/Notification";

export default function Navbar({ toggleSidebar, themeSwitcher, darkMode }) {
    const { auth } = usePage().props;
    const { availableStores, store } = usePage().props;
    const [showStoreSwitcher, setShowStoreSwitcher] = useState(false);
    const menuNavigation = Menu();

    // Get current page title
    const links = menuNavigation.flatMap((item) => item.details);
    const sublinks = links
        .filter((item) => item.hasOwnProperty("subdetails"))
        .flatMap((item) => item.subdetails);

    const getCurrentTitle = () => {
        for (const link of links) {
            if (link.hasOwnProperty("subdetails")) {
                const activeSublink = sublinks.find((s) => s.active);
                if (activeSublink) return activeSublink.title;
            } else if (link.active) {
                return link.title;
            }
        }
        return "Dashboard";
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <header
            className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6
            bg-white dark:bg-slate-900
            border-b border-slate-200 dark:border-slate-800
            transition-colors duration-200"
        >
            {/* Left Section */}
            <div className="flex items-center gap-4">
                {/* Sidebar Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="flex p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Toggle Sidebar"
                >
                    <IconMenu2 size={20} strokeWidth={1.5} />
                </button>

                {/* Mobile Logo */}
                <div className="md:hidden flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">K</span>
                    </div>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">
                        KASIR
                    </span>
                </div>

                {/* Current Page Title */}
                <div className="hidden md:flex items-center">
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mr-4" />
                    <h1 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                        {getCurrentTitle()}
                    </h1>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {/* Store Switcher */}
                {availableStores && availableStores.length > 1 && (
                    <div className="relative">
                        <button
                            onClick={() => setShowStoreSwitcher(!showStoreSwitcher)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                            <IconBuildingStore size={16} />
                            <span className="hidden sm:inline max-w-[100px] truncate">{store?.name || "Toko"}</span>
                            <IconSwitchHorizontal size={14} className="text-slate-400" />
                        </button>
                        {showStoreSwitcher && (
                            <div className="absolute right-0 top-full mt-1 w-60 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg z-50 py-1">
                                <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase">Pilih Toko</div>
                                {availableStores.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setShowStoreSwitcher(false);
                                            if (!s.is_current) {
                                                router.post(route("store-picker.switch"), { store_id: s.id });
                                            }
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors ${
                                            s.is_current
                                                ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                                                : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                                        }`}
                                    >
                                        <IconBuildingStore size={16} />
                                        <div className="flex-1">
                                            <div className="font-medium truncate">{s.name}</div>
                                            {s.is_branch && <div className="text-xs text-slate-400">Cabang</div>}
                                        </div>
                                        {s.is_current && <span className="text-xs text-primary-500 font-medium">Aktif</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Theme Toggle */}
                <button
                    onClick={themeSwitcher}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title={darkMode ? "Light Mode" : "Dark Mode"}
                >
                    {darkMode ? (
                        <IconSun
                            size={20}
                            strokeWidth={1.5}
                            className="text-amber-500"
                        />
                    ) : (
                        <IconMoon size={20} strokeWidth={1.5} />
                    )}
                </button>

                {/* Notifications */}
                <Notification />

                {/* Divider */}
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />

                {/* User Dropdown */}
                <AuthDropdown auth={auth} isMobile={isMobile} />
            </div>
        </header>
    );
}

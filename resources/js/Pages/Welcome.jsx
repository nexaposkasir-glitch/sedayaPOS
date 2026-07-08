import { Head, Link } from "@inertiajs/react";
import {
    IconShoppingCart,
    IconReceipt,
    IconUsers,
    IconChartBar,
    IconBox,
    IconArrowRight,
    IconCheck,
    IconDeviceMobile,
    IconReportMoney,
    IconTruck,
    IconBuildingWarehouse,
    IconShieldLock,
    IconCreditCard,
    IconBell,
    IconFileSpreadsheet,
} from "@tabler/icons-react";

export default function Welcome({ canLogin, canRegister }) {
    const features = [
        {
            icon: IconShoppingCart,
            title: "Transaksi Cepat",
            desc: "Proses jual beli dalam hitungan detik dengan antarmuka kasir yang intuitif. Dukungan barcode scanner untuk efisiensi maksimal.",
        },
        {
            icon: IconBox,
            title: "Inventori & Stok",
            desc: "Kelola stok produk, kategori, multi-satuan, batch & expired date. Notifikasi stok menipis otomatis agar tidak kehabisan.",
        },
        {
            icon: IconUsers,
            title: "Manajemen Pelanggan",
            desc: "Database pelanggan lengkap dengan riwayat transaksi, poin loyalitas, voucher, dan segmentasi untuk marketing.",
        },
        {
            icon: IconReceipt,
            title: "Multi Pembayaran",
            desc: "Tunai, transfer bank, QRIS, Midtrans, dan Xendit. Cetak struk thermal 58mm/80mm dan invoice profesional.",
        },
        {
            icon: IconChartBar,
            title: "Laporan & Analitik",
            desc: "Laporan penjualan, keuntungan, piutang, hutang, aging, dan grafik insight bisnis real-time.",
        },
        {
            icon: IconTruck,
            title: "Supply Chain",
            desc: "Purchase order, penerimaan barang, retur supplier, dan stock transfer antar gudang dalam satu sistem.",
        },
        {
            icon: IconCreditCard,
            title: "Piutang & Hutang",
            desc: "Pantau piutang pelanggan dan hutang ke supplier lengkap dengan notifikasi jatuh tempo.",
        },
        {
            icon: IconFileSpreadsheet,
            title: "Import & Export",
            desc: "Import data produk/pelanggan via Excel. Export laporan ke PDF, Excel, atau cetak langsung.",
        },
        {
            icon: IconBell,
            title: "Notifikasi Cerdas",
            desc: "Notifikasi stok rendah, piutang jatuh tempo, approval diskon, dan reminder shift kasir.",
        },
    ];

    const steps = [
        {
            number: "01",
            title: "Daftar Akun",
            desc: "Isi data toko Anda dalam 2 menit. Langsung dapat akses trial penuh.",
        },
        {
            number: "02",
            title: "Setup Toko",
            desc: "Tambah produk, atur harga, dan sesuaikan pengaturan sesuai kebutuhan bisnis.",
        },
        {
            number: "03",
            title: "Mulai Transaksi",
            desc: "Buka halaman kasir dan mulai layani pelanggan. Semua tercatat otomatis.",
        },
    ];

    return (
        <>
            <Head title="SedayaPOS - Aplikasi Kasir & Manajemen Bisnis" />

            <div className="min-h-screen bg-white">
                {/* Navbar */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <img src="/images/logo-sedaya.png" alt="SedayaPOS" className="h-8 w-auto" />
                            <span className="text-lg font-bold text-slate-900 tracking-tight">
                                Sedaya<span className="text-primary-500">POS</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {canLogin && (
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Masuk
                                </Link>
                            )}
                            {canRegister && (
                                <Link
                                    href="/register"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Daftar Gratis
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Left */}
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-medium mb-6">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Trial 30 Hari Gratis
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                                    Kelola Bisnis Lebih{" "}
                                    <span className="text-primary-500">Pintar</span>
                                    {" "}dengan Satu Aplikasi
                                </h1>

                                <p className="mt-5 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
                                    SedayaPOS adalah aplikasi kasir dan manajemen bisnis
                                    all-in-one. Catat transaksi, pantau stok, kelola
                                    pelanggan, dan dapatkan laporan real-time — semua
                                    dari satu dashboard.
                                </p>

                                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    {canRegister ? (
                                        <Link
                                            href="/register"
                                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-lg shadow-slate-900/10"
                                        >
                                            Mulai Trial Gratis
                                            <IconArrowRight size={18} />
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-lg shadow-slate-900/10"
                                        >
                                            Masuk ke Dashboard
                                            <IconArrowRight size={18} />
                                        </Link>
                                    )}
                                    <a
                                        href="#features"
                                        className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl transition-colors"
                                    >
                                        Lihat Fitur
                                    </a>
                                </div>

                                {/* Stats */}
                                <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-slate-100">
                                    {[
                                        { value: "50+", label: "Fitur Modul" },
                                        { value: "24/7", label: "Akses Online" },
                                        { value: "30 Hari", label: "Trial Gratis" },
                                    ].map((stat, i) => (
                                        <div key={i}>
                                            <div className="text-xl sm:text-2xl font-bold text-slate-900">
                                                {stat.value}
                                            </div>
                                            <div className="text-xs sm:text-sm text-slate-400 mt-0.5">
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right - Feature icon grid */}
                            <div className="hidden lg:grid grid-cols-3 gap-3">
                                {[
                                    { icon: IconShoppingCart, label: "Kasir", color: "bg-primary-50 text-primary-500" },
                                    { icon: IconBox, label: "Stok", color: "bg-amber-50 text-amber-500" },
                                    { icon: IconChartBar, label: "Laporan", color: "bg-emerald-50 text-emerald-500" },
                                    { icon: IconUsers, label: "Pelanggan", color: "bg-cyan-50 text-cyan-500" },
                                    { icon: IconCreditCard, label: "Pembayaran", color: "bg-violet-50 text-violet-500" },
                                    { icon: IconBuildingWarehouse, label: "Gudang", color: "bg-rose-50 text-rose-500" },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className={`${item.color} rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 aspect-square`}
                                    >
                                        <item.icon size={28} stroke={1.5} />
                                        <span className="text-xs font-semibold">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                Mulai dalam 3 Langkah
                            </h2>
                            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                                Tidak perlu instalasi rumit. Daftar, atur, dan langsung
                                bisa digunakan.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
                            {steps.map((step, i) => (
                                <div
                                    key={i}
                                    className="relative group"
                                >
                                    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 hover:border-primary-200 hover:shadow-lg transition-all">
                                        <div className="text-4xl sm:text-5xl font-black text-slate-100 group-hover:text-primary-100 transition-colors mb-4">
                                            {step.number}
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                    {/* Arrow connector */}
                                    {i < steps.length - 1 && (
                                        <div className="hidden sm:block absolute top-1/2 -right-4 text-slate-300 z-10">
                                            <IconArrowRight size={24} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="py-16 sm:py-20 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                Fitur Lengkap untuk Bisnis Anda
                            </h2>
                            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                                Semua modul yang Anda butuhkan untuk operasional toko
                                modern dalam satu aplikasi.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className="group p-5 sm:p-6 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all bg-white"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <feature.icon size={20} className="text-white" stroke={1.5} />
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
                                    Kenapa SedayaPOS?
                                </h2>
                                <div className="space-y-4">
                                    {[
                                        "Akses dari mana saja — desktop, tablet, maupun smartphone",
                                        "Data aman tersimpan di cloud dengan backup berkala",
                                        "Dukungan multi-user: admin, kasir, supervisor dengan hak akses berbeda",
                                        "Update fitur otomatis tanpa perlu install ulang",
                                        "Cocok untuk warung, toko retail, minimarket, dan UMKM",
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <IconCheck size={12} className="text-emerald-600" stroke={3} />
                                            </div>
                                            <span className="text-sm sm:text-base text-slate-600">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right side card */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                                        <IconShieldLock size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">Keamanan Terjamin</div>
                                        <div className="text-xs text-slate-400">Data Anda, prioritas kami</div>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        "Enkripsi data end-to-end",
                                        "Role-based access control (RBAC)",
                                        "Audit log semua aktivitas",
                                        "Password step-up untuk aksi sensitif",
                                        "Session timeout otomatis",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                                            <IconCheck size={14} className="text-emerald-500 flex-shrink-0" stroke={3} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 sm:py-20 px-4 sm:px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                                Siap Kelola Bisnis Lebih Profesional?
                            </h2>
                            <p className="text-slate-300 mb-8 max-w-md mx-auto">
                                Daftar sekarang dan nikmati trial 30 hari penuh. Tanpa
                                kartu kredit, tanpa komitmen.
                            </p>
                            {canRegister ? (
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
                                >
                                    Mulai Trial Gratis
                                    <IconArrowRight size={18} />
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
                                >
                                    Masuk ke Dashboard
                                    <IconArrowRight size={18} />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 px-4 sm:px-6 border-t border-slate-100">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                        <img src="/images/logo-sedaya.png" alt="SedayaPOS" className="h-7 w-auto" />
                        <span className="font-semibold text-slate-700 text-sm">
                            SedayaPOS
                        </span>
                    </div>
                        <p className="text-xs text-slate-400">
                            &copy; {new Date().getFullYear()} Malino_Seduh. Seluruh hak cipta dilindungi.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

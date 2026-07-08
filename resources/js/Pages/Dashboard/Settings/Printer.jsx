import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm } from "@inertiajs/react";
import toast from "react-hot-toast";
import {
    IconPrinter,
    IconBluetooth,
    IconPlugConnected,
    IconPlug,
    IconRefresh,
    IconSettings,
    IconCash,
} from "@tabler/icons-react";
import {
    connect,
    disconnect,
    testPrint,
    isConnected,
    getDeviceInfo,
    autoConnect,
} from "@/Utils/bluetoothPrinter";

export default function Printer({ settings }) {
    const { data, setData, post, processing } = useForm({
        printer_paper_size: settings.printer_paper_size || "80mm",
        printer_auto_print: settings.printer_auto_print || false,
        printer_cash_drawer: settings.printer_cash_drawer || false,
        printer_device_id: settings.printer_device_id || "",
        printer_device_name: settings.printer_device_name || "",
    });

    const [bluetoothStatus, setBluetoothStatus] = useState("disconnected"); // disconnected | connecting | connected
    const [deviceName, setDeviceName] = useState("");

    // Auto-reconnect on page load
    useEffect(() => {
        const devId = settings.printer_device_id;
        if (devId && !isConnected()) {
            autoConnect(devId)
                .then((ok) => {
                    if (ok) {
                        setBluetoothStatus("connected");
                        setDeviceName(getDeviceInfo()?.name || "");
                    }
                })
                .catch(() => {});
        }
    }, []);

    const handleConnect = async () => {
        setBluetoothStatus("connecting");
        try {
            const info = await connect();
            setBluetoothStatus("connected");
            setDeviceName(info.name);
            setData("printer_device_id", info.id);
            setData("printer_device_name", info.name);
            saveDeviceInfo(info.id, info.name);
            toast.success(`Terhubung ke ${info.name}`);
        } catch (err) {
            setBluetoothStatus("disconnected");
            if (err.name === "NotFoundError") {
                toast.error("Printer tidak ditemukan");
            } else if (err.name === "SecurityError") {
                toast.error("Izin Bluetooth dibutuhkan. Klik dari gesture user.");
            } else {
                toast.error("Gagal menghubungkan printer");
            }
        }
    };

    const saveDeviceInfo = (id, name) => {
        post(route("settings.printer.update"), {
            preserveScroll: true,
            onSuccess: () => {},
            onError: () => toast.error("Gagal menyimpan info device"),
        });
    };

    const handleDisconnect = async () => {
        await disconnect();
        setBluetoothStatus("disconnected");
        setDeviceName("");
        toast.success("Printer dilepas");
    };

    const handleTestPrint = async () => {
        try {
            await testPrint(settings.store_name || "SEDAYA POS", data.printer_paper_size);
            toast.success("Test print berhasil!");
        } catch (err) {
            toast.error("Test print gagal: " + err.message);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("settings.printer.update"), {
            preserveScroll: true,
            onSuccess: () => toast.success("Pengaturan printer disimpan"),
            onError: () => toast.error("Gagal menyimpan"),
        });
    };

    return (
        <>
            <Head title="Pengaturan Printer" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <IconPrinter size={28} className="text-primary-500" />
                        Pengaturan Printer
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Hubungkan printer thermal Bluetooth untuk cetak struk otomatis
                    </p>
                </div>

                {/* Bluetooth Connection */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-w-lg">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <IconBluetooth size={16} className="text-blue-500" />
                        Koneksi Bluetooth
                    </h3>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                        {bluetoothStatus === "connected" ? (
                            <IconPlugConnected size={20} className="text-success-500" />
                        ) : bluetoothStatus === "connecting" ? (
                            <IconRefresh size={20} className="text-warning-500 animate-spin" />
                        ) : (
                            <IconPlug size={20} className="text-slate-400" />
                        )}
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {bluetoothStatus === "connected"
                                ? `Terhubung: ${deviceName || "Printer Thermal"}`
                                : bluetoothStatus === "connecting"
                                ? "Menghubungkan..."
                                : "Tidak terhubung"}
                        </span>
                    </div>

                    <div className="flex gap-3">
                        {bluetoothStatus !== "connected" ? (
                            <button
                                type="button"
                                onClick={handleConnect}
                                disabled={bluetoothStatus === "connecting"}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors disabled:opacity-50"
                            >
                                <IconBluetooth size={16} />
                                {bluetoothStatus === "connecting" ? "Mencari..." : "Hubungkan Printer"}
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleTestPrint}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success-500 hover:bg-success-600 text-white font-medium text-sm transition-colors"
                                >
                                    <IconPrinter size={16} />
                                    Test Print
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDisconnect}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-danger-300 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/30 font-medium text-sm transition-colors"
                                >
                                    Putuskan
                                </button>
                            </>
                        )}
                    </div>

                    <p className="text-xs text-slate-400">
                        Kompatibel: semua printer thermal Bluetooth ESC/POS (Epson, Goojprt, Munbyn, Rongta, Xprinter, generik).
                        Bekerja di Chrome Android & Chrome/Edge Windows.
                    </p>
                </div>

                {/* Printer Settings */}
                <form onSubmit={submit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 max-w-lg">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <IconSettings size={16} />
                        Preferensi Cetak
                    </h3>

                    {/* Paper Size */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Ukuran Kertas
                        </label>
                        <select
                            value={data.printer_paper_size}
                            onChange={(e) => setData("printer_paper_size", e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 text-sm"
                        >
                            <option value="80mm">80 mm</option>
                            <option value="58mm">58 mm</option>
                        </select>
                    </div>

                    {/* Auto Print */}
                    <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.printer_auto_print}
                            onChange={(e) => setData("printer_auto_print", e.target.checked)}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        Cetak otomatis setelah transaksi
                        <span className="text-xs text-slate-400 ml-1">
                            (Bluetooth: langsung cetak. Non-Bluetooth: tampilkan preview)
                        </span>
                    </label>

                    {/* Cash Drawer */}
                    <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.printer_cash_drawer}
                            onChange={(e) => setData("printer_cash_drawer", e.target.checked)}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <IconCash size={16} className="text-warning-500" />
                        Buka laci uang (cash drawer) setelah cetak
                        <span className="text-xs text-slate-400 ml-1">
                            (via kabel RJ11 ke printer)
                        </span>
                    </label>

                    {/* Save */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"
                        >
                            {processing ? "Menyimpan..." : "Simpan Pengaturan"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Printer.layout = (page) => <DashboardLayout children={page} />;

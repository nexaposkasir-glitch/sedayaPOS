import { useState } from "react";
import { router } from "@inertiajs/react";
import { IconBuildingStore, IconArrowRight, IconBrandDatabricks } from "@tabler/icons-react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function StorePicker({ stores }) {
    const [loading, setLoading] = useState(null);

    const selectStore = (storeId) => {
        setLoading(storeId);
        router.post(route("store-picker.select"), { store_id: storeId });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <IconBrandDatabricks size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Pilih Toko</h1>
                    <p className="text-slate-500 mt-1">
                        Anda memiliki akses ke beberapa toko. Pilih toko yang ingin dibuka.
                    </p>
                </div>

                <div className="space-y-3">
                    {stores.map((store) => (
                        <button
                            key={store.id}
                            onClick={() => selectStore(store.id)}
                            disabled={loading !== null}
                            className="w-full bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between hover:border-primary-300 hover:shadow-sm transition-all text-left disabled:opacity-50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                                    <IconBuildingStore size={20} className="text-primary-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900">{store.name}</div>
                                    <div className="text-xs text-slate-500">
                                        {store.plan_name && <span>{store.plan_name}</span>}
                                        {store.is_branch && store.parent_name && (
                                            <span className="text-primary-500"> · Cabang dari {store.parent_name}</span>
                                        )}
                                        {store.city && <span> · {store.city}</span>}
                                    </div>
                                </div>
                            </div>
                            <IconArrowRight size={18} className={`text-slate-400 ${loading === store.id ? "animate-pulse" : ""}`} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

StorePicker.layout = (page) => <GuestLayout children={page} />;

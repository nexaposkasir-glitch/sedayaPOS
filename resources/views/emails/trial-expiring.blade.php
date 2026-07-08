<x-mail::message>
# Masa Trial Akan Berakhir

Halo {{ $storeName }},

Masa trial Anda akan berakhir dalam **{{ $daysRemaining }} hari**. Untuk tetap menggunakan SedayaPOS tanpa gangguan, segera upgrade ke paket berbayar.

<x-mail::button :url="$plansUrl">
Lihat Paket Langganan
</x-mail::button>

Terima kasih,<br>
Tim SedayaPOS
</x-mail::message>

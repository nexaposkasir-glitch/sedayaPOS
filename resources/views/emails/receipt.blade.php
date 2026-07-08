<x-mail::message>
# Pembayaran Berhasil

Halo {{ $storeName }},

Pembayaran langganan Anda telah berhasil dikonfirmasi.

<x-mail::table>
| Detail | |
|--------|---|
| Paket | {{ $planName }} |
| Jumlah | Rp {{ number_format($amount, 0, ',', '.') }} |
| Metode | {{ $gateway }} |
| Tanggal | {{ $paidAt }} |
</x-mail::table>

<x-mail::button :url="$subscriptionUrl">
Lihat Status Langganan
</x-mail::button>

Terima kasih,<br>
Tim SedayaPOS
</x-mail::message>

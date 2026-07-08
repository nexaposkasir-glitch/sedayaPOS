<x-mail::message>
# Langganan Akan Berakhir

Halo {{ $storeName }},

Langganan Anda akan berakhir dalam **{{ $daysRemaining }} hari**. Segera perpanjang agar layanan tetap aktif tanpa gangguan.

@if($paymentUrl)
<x-mail::button :url="$paymentUrl">
Perpanjang Sekarang
</x-mail::button>

Atau kunjungi halaman langganan untuk memilih paket:
@else
<x-mail::button :url="$plansUrl">
Pilih Paket Langganan
</x-mail::button>
@endif

Jika Anda sudah melakukan pembayaran, abaikan email ini.

Terima kasih,<br>
Tim SedayaPOS
</x-mail::message>

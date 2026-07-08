<?php

namespace App\Mail;

use App\Models\Store;
use App\Models\SubscriptionPayment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Store $store,
        public SubscriptionPayment $payment,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Pembayaran Berhasil - {$this->store->name} - SedayaPOS",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.receipt',
            with: [
                'storeName' => $this->store->name,
                'planName' => $this->payment->plan->name,
                'amount' => $this->payment->amount,
                'paidAt' => $this->payment->paid_at->format('d M Y H:i'),
                'gateway' => $this->payment->gateway,
                'subscriptionUrl' => url('/dashboard/subscription'),
            ],
        );
    }
}

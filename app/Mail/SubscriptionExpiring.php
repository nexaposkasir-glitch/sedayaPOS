<?php

namespace App\Mail;

use App\Models\Store;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionExpiring extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Store $store,
        public int $daysRemaining,
        public ?string $paymentUrl = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Langganan {$this->store->name} Akan Berakhir - SedayaPOS",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.subscription-expiring',
            with: [
                'storeName' => $this->store->name,
                'daysRemaining' => $this->daysRemaining,
                'paymentUrl' => $this->paymentUrl,
                'plansUrl' => url('/dashboard/subscription'),
            ],
        );
    }
}

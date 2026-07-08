<?php

namespace App\Mail;

use App\Models\Store;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TrialExpiring extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Store $store,
        public int $daysRemaining,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Masa Trial {$this->store->name} Akan Berakhir - SedayaPOS",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.trial-expiring',
            with: [
                'storeName' => $this->store->name,
                'daysRemaining' => $this->daysRemaining,
                'plansUrl' => url('/dashboard/subscription'),
            ],
        );
    }
}

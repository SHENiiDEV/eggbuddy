<?php

namespace App\Mail;

use App\Billing\InvoiceService;
use App\Models\Payment;
use App\Support\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Payment confirmation with the PDF invoice. It also confirms, on a durable
 * medium, the customer's consent to immediate supply of digital content.
 */
class TopUpReceiptMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Payment $payment) {}

    public function envelope(): Envelope
    {
        $this->payment->loadMissing('invoice');

        return new Envelope(subject: 'Payment confirmed - '.number_format($this->payment->totalCoins()).' coins added (Invoice '.$this->payment->invoice?->number.')');
    }

    public function content(): Content
    {
        $this->payment->loadMissing('invoice', 'user');

        return new Content(view: 'mail.topup', with: [
            'payment' => $this->payment,
            'invoice' => $this->payment->invoice,
            'company' => Company::details(),
            'balance' => $this->payment->user?->coins,
        ]);
    }

    public function attachments(): array
    {
        $invoice = $this->payment->invoice()->first();
        if (! $invoice) {
            return [];
        }

        return [
            Attachment::fromData(fn () => app(InvoiceService::class)->pdf($invoice), $invoice->filename())
                ->withMime('application/pdf'),
        ];
    }
}

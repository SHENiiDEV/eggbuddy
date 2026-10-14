<?php

namespace App\Mail;

use App\Legal\LegalDocuments;
use App\Models\User;
use App\Support\Company;
use App\Support\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

/**
 * Sent right after sign-up. Attaches an account confirmation and the exact
 * Terms & Conditions the customer accepted, so they have both on a durable medium.
 */
class WelcomeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public User $user) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Welcome to '.config('app.name').'! Your egg is warming up');
    }

    public function content(): Content
    {
        return new Content(view: 'mail.welcome', with: [
            'user' => $this->user,
            'company' => Company::details(),
            'starterCoins' => (int) config('game.starter_coins'),
        ]);
    }

    public function attachments(): array
    {
        $brand = Str::slug(config('app.name'));
        $version = config('legal.version');

        return [
            Attachment::fromData(fn () => self::accountConfirmationPdf($this->user), "{$brand}-account-confirmation.pdf")
                ->withMime('application/pdf'),
            Attachment::fromData(fn () => self::legalPdf('terms'), "{$brand}-terms-and-conditions-v{$version}.pdf")
                ->withMime('application/pdf'),
        ];
    }

    public static function accountConfirmationPdf(User $user): string
    {
        $legal = app(LegalDocuments::class);

        return app(Pdf::class)->render('pdf.account-confirmation', [
            'user' => $user,
            'company' => Company::details(),
            'documents' => collect($legal->all())->map(fn ($title, $key) => ['title' => $title, 'url' => route('legal.show', $key)])->values(),
            'effectiveDate' => $legal->effectiveDate(),
        ]);
    }

    public static function legalPdf(string $key): string
    {
        return app(Pdf::class)->render('pdf.legal-document', [
            'doc' => app(LegalDocuments::class)->render($key),
            'company' => Company::details(),
        ]);
    }
}

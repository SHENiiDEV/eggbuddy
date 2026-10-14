<?php

namespace App\Billing;

use App\Models\Invoice;
use App\Models\Payment;
use App\Support\Company;
use App\Support\Countries;
use App\Support\Pdf;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function __construct(private readonly Pdf $pdf) {}

    /** Issue the invoice for a paid payment (once). Numbers are sequential per year: EB-2026-000001. */
    public function issue(Payment $payment): Invoice
    {
        if ($existing = $payment->invoice()->first()) {
            return $existing;
        }

        return DB::transaction(function () use ($payment) {
            $year = (int) now()->year;
            $sequence = (int) Invoice::query()->where('year', $year)->lockForUpdate()->max('sequence') + 1;
            $prefix = config('payments.invoice.prefix', 'INV');

            $rate = (float) config('payments.invoice.vat_rate', 0);
            $total = $payment->amount;
            $vat = $rate > 0 ? (int) round($total - $total / (1 + $rate / 100)) : 0;

            return Invoice::create([
                'payment_id' => $payment->id,
                'user_id' => $payment->user_id,
                'number' => sprintf('%s-%d-%06d', $prefix, $year, $sequence),
                'year' => $year,
                'sequence' => $sequence,
                'issued_at' => $payment->paid_at ?? now(),
                'seller' => Company::details(),
                'buyer' => [
                    'name' => trim($payment->billing_first_name.' '.$payment->billing_last_name),
                    'email' => $payment->billing_email,
                    'phone' => $payment->billing_phone,
                    'address_line' => $payment->billing_address_line,
                    'city' => $payment->billing_city,
                    'postcode' => $payment->billing_postcode,
                    'country' => Countries::name($payment->billing_country),
                    'customer_id' => $payment->user_id ? 'C-'.str_pad((string) $payment->user_id, 6, '0', STR_PAD_LEFT) : null,
                ],
                'lines' => [[
                    'description' => $payment->description,
                    'details' => number_format($payment->coins).' coins'.($payment->bonus_coins ? ' + '.number_format($payment->bonus_coins).' bonus coins' : '').' - digital in-game currency, delivered instantly',
                    'quantity' => 1,
                    'unit_price' => $total,
                    'total' => $total,
                ]],
                'net_amount' => $total - $vat,
                'vat_rate' => $rate,
                'vat_amount' => $vat,
                'total' => $total,
                'currency' => $payment->currency,
            ]);
        }, 5);
    }

    public function pdf(Invoice $invoice): string
    {
        $invoice->loadMissing('payment');

        return $this->pdf->render('pdf.invoice', [
            'invoice' => $invoice,
            'payment' => $invoice->payment,
        ]);
    }
}

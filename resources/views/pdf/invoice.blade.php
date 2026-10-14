@php

    $seller = $invoice->seller;
    $buyer = $invoice->buyer;
    $company = $seller;
    $cur = $invoice->currency;
@endphp
@extends('pdf.layout', ['title' => 'Invoice '.$invoice->number, 'headerRight' => 'Invoice '.$invoice->number])

@section('content')
    <table>
        <tr>
            <td style="vertical-align: top;">
                <h1>Invoice</h1>
                <div class="muted">Receipt for digital content</div>
            </td>
            <td class="right" style="vertical-align: top;">
                @if($payment?->status === 'refunded')
                    <span class="pill" style="background:#FDE2E2;color:#8A1F1F;border:1px solid #8A1F1F;">REFUNDED</span>
                @else
                    <span class="pill pill-paid">PAID</span>
                @endif
            </td>
        </tr>
    </table>

    <table style="margin-top: 16px;">
        <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                <table class="small">
                    <tr><td class="muted" style="width: 42%; padding: 2px 0;">Invoice number</td><td style="padding: 2px 0;"><strong>{{ $invoice->number }}</strong></td></tr>
                    <tr><td class="muted" style="padding: 2px 0;">Issue date</td><td style="padding: 2px 0;">{{ $invoice->issued_at->format('j F Y') }}</td></tr>
                    <tr><td class="muted" style="padding: 2px 0;">Supply / payment date</td><td style="padding: 2px 0;">{{ ($payment?->paid_at ?? $invoice->issued_at)->format('j F Y, H:i') }} UTC</td></tr>
                    <tr><td class="muted" style="padding: 2px 0;">Payment method</td><td style="padding: 2px 0;">Card payment</td></tr>
                    <tr><td class="muted" style="padding: 2px 0;">Payment reference</td><td style="padding: 2px 0;">{{ $payment?->gateway_reference ?? $payment?->uuid }}</td></tr>
                    <tr><td class="muted" style="padding: 2px 0;">Order ID</td><td style="padding: 2px 0;">{{ $payment?->uuid }}</td></tr>
                </table>
            </td>
            <td style="width: 50%; vertical-align: top;"></td>
        </tr>
    </table>

    <table style="margin-top: 16px;">
        <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 8px;">
                <div class="box">
                    <div class="muted small" style="text-transform: uppercase; letter-spacing: .6px;">Seller</div>
                    <strong>{{ $seller['name'] }}</strong><br>
                    @if(!empty($seller['number']))Reg. No. {{ $seller['number'] }}<br>@endif
                    @if(!empty($seller['vat_number']))VAT No. {{ $seller['vat_number'] }}<br>@endif
                    {{ $seller['address'] }}<br>
                    {{ $seller['country'] }}<br>
                    {{ $seller['email'] }}@if(!empty($seller['phone'])) · {{ $seller['phone'] }}@endif<br>
                    {{ $seller['website'] }}
                </div>
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 8px;">
                <div class="box">
                    <div class="muted small" style="text-transform: uppercase; letter-spacing: .6px;">Bill to</div>
                    <strong>{{ $buyer['name'] }}</strong><br>
                    {{ $buyer['address_line'] }}<br>
                    {{ $buyer['postcode'] }} {{ $buyer['city'] }}<br>
                    {{ $buyer['country'] }}<br>
                    {{ $buyer['email'] }}@if(!empty($buyer['phone'])) · {{ $buyer['phone'] }}@endif<br>
                    @if(!empty($buyer['customer_id']))Customer ID {{ $buyer['customer_id'] }}@endif
                </div>
            </td>
        </tr>
    </table>

    <table class="lines" style="margin-top: 22px;">
        <thead>
        <tr>
            <th style="width: 58%;">Description</th>
            <th class="right">Qty</th>
            <th class="right">Unit price</th>
            <th class="right">Amount</th>
        </tr>
        </thead>
        <tbody>
        @foreach($invoice->lines as $line)
            <tr>
                <td><strong>{{ $line['description'] }}</strong><br><span class="muted small">{{ $line['details'] ?? '' }}</span></td>
                <td class="right">{{ $line['quantity'] }}</td>
                <td class="right">{{ \App\Support\Money::format($line['unit_price'], $cur) }}</td>
                <td class="right">{{ \App\Support\Money::format($line['total'], $cur) }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <table style="margin-top: 10px;">
        <tr>
            <td style="width: 55%;"></td>
            <td style="width: 45%;">
                <table class="totals">
                    @if($invoice->vat_rate > 0)
                        <tr><td class="muted">Net amount</td><td class="right">{{ \App\Support\Money::format($invoice->net_amount, $cur) }}</td></tr>
                        <tr><td class="muted">VAT {{ rtrim(rtrim(number_format($invoice->vat_rate, 2), '0'), '.') }}%</td><td class="right">{{ \App\Support\Money::format($invoice->vat_amount, $cur) }}</td></tr>
                    @else
                        <tr><td class="muted">Subtotal</td><td class="right">{{ \App\Support\Money::format($invoice->net_amount, $cur) }}</td></tr>
                    @endif
                    <tr class="grand"><td>Total paid ({{ $cur }})</td><td class="right">{{ \App\Support\Money::format($invoice->total, $cur) }}</td></tr>
                </table>
            </td>
        </tr>
    </table>

    <div class="box small" style="margin-top: 26px; border-color: #EAD9E6;">
        <strong>Notes</strong><br>
        Digital content (virtual in-game coins) supplied electronically and credited to the customer's account immediately after payment. No physical delivery.
        @if($payment?->immediate_supply_consent_at)
            On {{ $payment->immediate_supply_consent_at->format('j F Y, H:i') }} UTC the customer expressly requested immediate supply and acknowledged the loss of the right of withdrawal once supply has begun.
        @endif
        @if($invoice->vat_rate <= 0)
            Prices include all applicable taxes.
        @endif
        The charge appears on the card statement as <strong>{{ $seller['descriptor'] ?? config('company.descriptor') }}</strong>.
        Refunds are handled under our Refund &amp; Cancellation Policy: {{ route('legal.show', 'refunds') }}.
        Questions about this invoice: {{ $seller['email'] }}.
    </div>

    <p class="muted small" style="margin-top: 18px;">Thank you for playing {{ config('app.name') }}!</p>
@endsection

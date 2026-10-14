@extends('mail.layout', ['title' => 'Payment confirmed'])

@section('content')
    <h1 style="margin:0 0 12px;font-size:26px;line-height:32px;font-weight:800;color:#3B2346;">Thank you, {{ $payment->billing_first_name }}!</h1>
    <p style="margin:0 0 18px;font-size:16px;line-height:24px;">
        Your payment was successful and <strong>{{ number_format($payment->totalCoins()) }} coins</strong> have been added to your wallet.
        @if(! is_null($balance)) Your balance is now <strong>{{ number_format($balance) }} coins</strong>.@endif
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #3B2346;border-radius:16px;margin:0 0 20px;font-size:14px;line-height:20px;">
        <tr><td style="padding:14px 16px 4px;color:#7A6585;width:45%;">Invoice number</td><td style="padding:14px 16px 4px;font-weight:700;">{{ $invoice?->number }}</td></tr>
        <tr><td style="padding:4px 16px;color:#7A6585;">Date</td><td style="padding:4px 16px;">{{ $payment->paid_at?->format('j F Y, H:i') }} UTC</td></tr>
        <tr><td style="padding:4px 16px;color:#7A6585;">Item</td><td style="padding:4px 16px;">{{ $payment->description }}</td></tr>
        <tr><td style="padding:4px 16px;color:#7A6585;">Coins</td><td style="padding:4px 16px;">{{ number_format($payment->coins) }}@if($payment->bonus_coins) + {{ number_format($payment->bonus_coins) }} bonus @endif</td></tr>
        <tr><td style="padding:4px 16px;color:#7A6585;">Payment reference</td><td style="padding:4px 16px;">{{ $payment->gateway_reference ?? $payment->uuid }}</td></tr>
        <tr><td style="padding:4px 16px 14px;color:#7A6585;">Amount paid</td><td style="padding:4px 16px 14px;font-size:18px;font-weight:800;">{{ $payment->formattedAmount() }}</td></tr>
    </table>

    <p style="margin:0 0 14px;font-size:14px;line-height:21px;color:#5B4766;">
        Your invoice is attached as a PDF and is always available in your account. The charge will appear on your card statement as <strong>{{ $company['descriptor'] }}</strong>.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
        <tr><td style="background:#FF8FBA;border:3px solid #3B2346;border-radius:999px;box-shadow:0 4px 0 #3B2346;">
            <a href="{{ route('play') }}" style="display:inline-block;padding:12px 26px;font-size:16px;font-weight:800;color:#3B2346;text-decoration:none;">Back to my buddy</a>
        </td></tr>
    </table>

    <p style="margin:0 0 10px;font-size:12px;line-height:18px;color:#7A6585;">
        <strong>Confirmation of your order:</strong> you purchased digital content (virtual coins) from {{ $company['name'] }} under our
        <a href="{{ route('legal.show', 'terms') }}" style="color:#7A3E8F;">Terms &amp; Conditions</a> (version {{ config('legal.version') }}).
        At checkout on {{ $payment->immediate_supply_consent_at?->format('j F Y, H:i') }} UTC you expressly requested that the coins be supplied immediately and acknowledged that you lose your right of withdrawal once they are credited to your account. They were credited on {{ $payment->paid_at?->format('j F Y, H:i') }} UTC.
        Your rights to a refund are described in our <a href="{{ route('legal.show', 'refunds') }}" style="color:#7A3E8F;">Refund &amp; Cancellation Policy</a>.
    </p>
    <p style="margin:0;font-size:12px;line-height:18px;color:#7A6585;">
        Don't recognise this payment? Contact us right away at <a href="mailto:{{ $company['email'] }}" style="color:#7A3E8F;">{{ $company['email'] }}</a>.
    </p>
@endsection

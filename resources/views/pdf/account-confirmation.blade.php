
@extends('pdf.layout', ['title' => 'Account confirmation', 'headerRight' => 'Account confirmation'])

@section('content')
    <h1>Welcome to {{ config('app.name') }}</h1>
    <p class="muted">Account confirmation · issued {{ now()->format('j F Y, H:i') }} UTC</p>

    <p style="font-size: 11px;">
        Dear {{ $user->first_name }}, thank you for creating your {{ config('app.name') }} account. This document confirms your registration
        and records your acceptance of our customer policies. Please keep it for your records.
    </p>

    <h2>Account holder</h2>
    <div class="box">
        <table>
            <tr><td class="muted" style="width: 34%; padding: 3px 0;">Customer ID</td><td>C-{{ str_pad((string) $user->id, 6, '0', STR_PAD_LEFT) }}</td></tr>
            <tr><td class="muted" style="padding: 3px 0;">Name</td><td>{{ $user->first_name }}</td></tr>
            <tr><td class="muted" style="padding: 3px 0;">Surname</td><td>{{ $user->last_name }}</td></tr>
            <tr><td class="muted" style="padding: 3px 0;">Email</td><td>{{ $user->email }}</td></tr>
            <tr><td class="muted" style="padding: 3px 0;">Phone number</td><td>{{ $user->phone }}</td></tr>
            <tr><td class="muted" style="padding: 3px 0;">Date of birth</td><td>{{ $user->date_of_birth->format('j F Y') }}</td></tr>
            <tr><td class="muted" style="padding: 3px 0;">Street, house, apartment</td><td>{{ $user->address_line }}</td></tr>
            <tr><td class="muted" style="padding: 3px 0;">City</td><td>{{ $user->city }}</td></tr>
            <tr><td class="muted" style="padding: 3px 0;">Country</td><td>{{ \App\Support\Countries::name($user->country) }}</td></tr>
            <tr><td class="muted" style="padding: 3px 0;">Post code</td><td>{{ $user->postcode }}</td></tr>
            <tr><td class="muted" style="padding: 3px 0;">Registered on</td><td>{{ $user->created_at->format('j F Y, H:i') }} UTC</td></tr>
        </table>
    </div>

    <h2>Acceptance of Terms</h2>
    <div class="box">
        <p style="margin: 0 0 6px;">
            &#9745; I agree to the Terms &amp; Conditions and Privacy Policy.
        </p>
        <table class="small">
            <tr><td class="muted" style="width: 34%; padding: 2px 0;">Accepted on</td><td>{{ $user->terms_accepted_at->format('j F Y, H:i:s') }} UTC</td></tr>
            <tr><td class="muted" style="padding: 2px 0;">Policy version</td><td>{{ $user->terms_version }} (effective {{ $effectiveDate }})</td></tr>
            <tr><td class="muted" style="padding: 2px 0;">IP address</td><td>{{ $user->terms_ip ?? 'n/a' }}</td></tr>
        </table>
    </div>

    <h2>Our policies</h2>
    <table class="small">
        @foreach($documents as $doc)
            <tr><td style="padding: 2px 0; width: 34%;">{{ $doc['title'] }}</td><td><a href="{{ $doc['url'] }}">{{ $doc['url'] }}</a></td></tr>
        @endforeach
    </table>
    <p class="small muted">A copy of the Terms &amp; Conditions you accepted is attached to the same email.</p>

    <h2>Good to know</h2>
    <ul class="small" style="padding-left: 14px; margin: 0;">
        <li>{{ config('app.name') }} is a virtual pet game for adults aged {{ config('legal.min_age') }}+. Coins are virtual and have no cash value.</li>
        <li>All purchases are one-time payments. We never charge your card automatically.</li>
        <li>Card payments appear on your statement as <strong>{{ $company['descriptor'] }}</strong>.</li>
        <li>You can update your details or close your account at any time on your account page.</li>
        <li>Need help? Email {{ $company['email'] }}@if($company['phone']) or call {{ $company['phone'] }}@endif ({{ $company['support_hours'] }}).</li>
    </ul>
@endsection

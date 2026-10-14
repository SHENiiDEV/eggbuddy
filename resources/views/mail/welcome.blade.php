@extends('mail.layout', ['title' => 'Welcome to '.config('app.name')])

@section('content')
    <h1 style="margin:0 0 12px;font-size:26px;line-height:32px;font-weight:800;color:#3B2346;">Welcome, {{ $user->first_name }}!</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:24px;">
        Your {{ config('app.name') }} account is ready and your very first egg is already warming up. In about a minute it will hatch into a tiny buddy who needs you to feed it, play with it, clean up after it and tuck it in at night.
    </p>

    @if($starterCoins > 0)
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
            <tr><td style="background:#FFF0B8;border:2px solid #3B2346;border-radius:16px;padding:14px 16px;font-size:15px;line-height:22px;">
                <strong>Welcome gift:</strong> {{ $starterCoins }} coins are already in your wallet. Spend them on treats or a new look in the shop.
            </td></tr>
        </table>
    @endif

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr><td style="background:#FF8FBA;border:3px solid #3B2346;border-radius:999px;box-shadow:0 4px 0 #3B2346;">
            <a href="{{ route('play') }}" style="display:inline-block;padding:12px 26px;font-size:16px;font-weight:800;color:#3B2346;text-decoration:none;">Meet your egg</a>
        </td></tr>
    </table>

    <h2 style="margin:0 0 8px;font-size:17px;color:#3B2346;">Your account details</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:20px;margin:0 0 20px;">
        <tr><td style="padding:4px 0;color:#7A6585;width:40%;">Name</td><td style="padding:4px 0;">{{ $user->full_name }}</td></tr>
        <tr><td style="padding:4px 0;color:#7A6585;">Email</td><td style="padding:4px 0;">{{ $user->email }}</td></tr>
        <tr><td style="padding:4px 0;color:#7A6585;">Registered</td><td style="padding:4px 0;">{{ $user->created_at->format('j F Y, H:i') }} UTC</td></tr>
        <tr><td style="padding:4px 0;color:#7A6585;">Terms accepted</td><td style="padding:4px 0;">Version {{ $user->terms_version }}</td></tr>
    </table>

    <p style="margin:0 0 12px;font-size:14px;line-height:21px;color:#5B4766;">
        <strong>Attached:</strong> your account confirmation and a copy of the Terms &amp; Conditions you accepted, for your records. You can also read our policies online at any time.
    </p>
    <p style="margin:0;font-size:14px;line-height:21px;color:#5B4766;">
        Didn't create this account? Please let us know at <a href="mailto:{{ $company['email'] }}" style="color:#7A3E8F;">{{ $company['email'] }}</a>.
    </p>
@endsection

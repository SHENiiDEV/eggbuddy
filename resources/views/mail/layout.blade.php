<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>{{ $title ?? config('app.name') }}</title>
</head>
<body style="margin:0;padding:0;background:#FFF4EA;font-family:'Nunito','Segoe UI',Helvetica,Arial,sans-serif;color:#3B2346;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF4EA;">
    <tr>
        <td align="center" style="padding:32px 12px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
                <tr>
                    <td style="padding:0 4px 18px;">
                        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                            <td style="width:34px;height:40px;background:#FF8FBA;border:3px solid #3B2346;border-radius:50% 50% 46% 46% / 60% 60% 40% 40%;"></td>
                            <td style="padding-left:12px;font-size:22px;font-weight:800;letter-spacing:-0.3px;color:#3B2346;">{{ config('app.name') }}</td>
                        </tr></table>
                    </td>
                </tr>
                <tr>
                    <td style="background:#ffffff;border:3px solid #3B2346;border-radius:24px;padding:32px 28px;box-shadow:0 6px 0 #3B2346;">
                        @yield('content')
                    </td>
                </tr>
                <tr>
                    <td style="padding:22px 8px 0;font-size:12px;line-height:18px;color:#7A6585;text-align:center;">
                        {{ $company['name'] }}@if($company['number']) · Reg. No. {{ $company['number'] }}@endif<br>
                        {{ $company['address'] }}@if($company['country']), {{ $company['country'] }}@endif<br>
                        Support: <a href="mailto:{{ $company['email'] }}" style="color:#7A3E8F;">{{ $company['email'] }}</a>@if($company['phone']) · {{ $company['phone'] }}@endif<br><br>
                        <a href="{{ route('legal.show', 'terms') }}" style="color:#7A3E8F;">Terms &amp; Conditions</a> ·
                        <a href="{{ route('legal.show', 'privacy') }}" style="color:#7A3E8F;">Privacy Policy</a> ·
                        <a href="{{ route('legal.show', 'refunds') }}" style="color:#7A3E8F;">Refund Policy</a><br><br>
                        This is a service email about your account. You receive it because you have an account at {{ config('app.name') }}.
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>

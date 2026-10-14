<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $title ?? config('app.name') }}</title>
    <style>
        @page { margin: 120px 48px 80px 48px; }
        * { box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; line-height: 1.5; color: #3B2346; }
        header { position: fixed; top: -92px; left: 0; right: 0; height: 70px; }
        footer { position: fixed; bottom: -56px; left: 0; right: 0; height: 40px; font-size: 7.5px; color: #8A7593; border-top: 1px solid #EAD9E6; padding-top: 8px; }
        .brand-egg { display: inline-block; width: 22px; height: 27px; background: #FF8FBA; border: 2.5px solid #3B2346; border-radius: 50% 50% 46% 46%; vertical-align: middle; }
        .brand-name { display: inline-block; font-size: 18px; font-weight: bold; vertical-align: middle; margin-left: 8px; }
        .muted { color: #8A7593; }
        .small { font-size: 8.5px; }
        h1 { font-size: 22px; margin: 0 0 4px; }
        h2 { font-size: 12.5px; margin: 18px 0 6px; }
        h3 { font-size: 11px; margin: 12px 0 4px; }
        table { border-collapse: collapse; width: 100%; }
        .box { border: 1.5px solid #3B2346; border-radius: 10px; padding: 12px 14px; }
        .pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 9px; font-weight: bold; }
        .pill-paid { background: #D6F5D0; color: #1F5E2A; border: 1px solid #1F5E2A; }
        .lines th { text-align: left; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.6px; color: #8A7593; border-bottom: 1.5px solid #3B2346; padding: 6px 6px; }
        .lines td { padding: 9px 6px; border-bottom: 1px solid #EAD9E6; vertical-align: top; }
        .right { text-align: right; }
        .totals td { padding: 4px 6px; }
        .grand td { font-size: 13px; font-weight: bold; border-top: 1.5px solid #3B2346; padding-top: 8px; }
        a { color: #7A3E8F; }
    </style>
    @stack('styles')
</head>
<body>
<header>
    <table>
        <tr>
            <td style="vertical-align: middle;"><span class="brand-egg"></span><span class="brand-name">{{ config('app.name') }}</span></td>
            <td class="right muted small" style="vertical-align: middle;">{{ $headerRight ?? '' }}</td>
        </tr>
    </table>
</header>
<footer>
    <table>
        <tr>
            <td>{{ \App\Support\Company::oneLiner() }}<br>{{ $company['email'] ?? config('company.email') }} · {{ $company['website'] ?? config('app.url') }}</td>
        </tr>
    </table>
</footer>
<main>
    @yield('content')
</main>
</body>
</html>

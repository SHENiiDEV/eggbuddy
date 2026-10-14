<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#FFF4EA">
    <meta name="description" content="{{ config('app.name') }} - hatch, raise and pamper your own retro pocket pet. Feed it, play with it, tuck it in and watch it grow.">
    <meta property="og:title" content="{{ config('app.name') }} - your retro pocket pet">
    <meta property="og:description" content="Hatch an egg, raise a tiny buddy and dress it up with skins. A virtual pet game for grown-ups who miss the 90s.">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <title inertia>{{ config('app.name') }}</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx', "resources/js/pages/{$page['component']}.jsx"])
    @inertiaHead
</head>
<body class="antialiased">
    @inertia
</body>
</html>

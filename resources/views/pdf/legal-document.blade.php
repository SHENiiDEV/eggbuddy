@extends('pdf.layout', ['title' => $doc['title'], 'headerRight' => $doc['title'].' · v'.$doc['version']])

@push('styles')
    <style>
        .legal h2 { font-size: 12px; margin: 16px 0 5px; page-break-after: avoid; }
        .legal p, .legal li { font-size: 9.5px; }
        .legal ul, .legal ol { padding-left: 16px; margin: 4px 0 8px; }
        .legal table { margin: 6px 0 10px; }
        .legal th, .legal td { border: 1px solid #EAD9E6; padding: 4px 5px; font-size: 8.5px; vertical-align: top; text-align: left; }
        .legal th { background: #FBF1F7; }
        .legal code { font-family: 'DejaVu Sans Mono', monospace; font-size: 8px; }
    </style>
@endpush

@section('content')
    <h1>{{ $doc['title'] }}</h1>
    <p class="muted">Version {{ $doc['version'] }} · Effective {{ $doc['effective_date'] }}</p>
    <div class="legal">
        {!! $doc['html'] !!}
    </div>
@endsection

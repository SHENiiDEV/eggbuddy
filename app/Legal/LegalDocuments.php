<?php

namespace App\Legal;

use App\Support\Company;
use App\Support\Countries;
use App\Support\Money;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Customer-facing policies. Sources are Markdown files in resources/legal with
 * {{placeholders}} that are filled from the company, legal and payment config,
 * so the merchant details are identical on the site, in emails and in PDFs.
 */
class LegalDocuments
{
    public function all(): array
    {
        return config('legal.documents', []);
    }

    public function exists(string $key): bool
    {
        return array_key_exists($key, $this->all()) && is_file($this->path($key));
    }

    public function title(string $key): string
    {
        return $this->all()[$key] ?? Str::headline($key);
    }

    public function markdown(string $key): string
    {
        return strtr(file_get_contents($this->path($key)), $this->placeholders());
    }

    /** @return array{key: string, title: string, html: string, toc: list<array{id: string, title: string}>, version: string, effective_date: string} */
    public function render(string $key): array
    {
        $html = Str::markdown($this->markdown($key), [
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);

        $toc = [];
        $used = [];
        $html = preg_replace_callback('#<h2>(.*?)</h2>#s', function ($m) use (&$toc, &$used) {
            $text = trim(strip_tags($m[1]));
            $id = Str::slug(preg_replace('/^\d+\.\s*/', '', $text)) ?: 'section';
            while (isset($used[$id])) {
                $id .= '-x';
            }
            $used[$id] = true;
            $toc[] = ['id' => $id, 'title' => html_entity_decode($text)];

            return '<h2 id="'.$id.'">'.$m[1].'</h2>';
        }, $html);

        // External links open in a new tab.
        $html = preg_replace('#<a href="(https?://(?!'.preg_quote(parse_url(config('app.url'), PHP_URL_HOST) ?: 'localhost', '#').')[^"]+)"#', '<a href="$1" target="_blank" rel="noopener noreferrer"', $html);

        return [
            'key' => $key,
            'title' => $this->title($key),
            'html' => $html,
            'toc' => $toc,
            'version' => (string) config('legal.version'),
            'effective_date' => $this->effectiveDate(),
        ];
    }

    public function effectiveDate(): string
    {
        return Carbon::parse(config('legal.effective_date'))->format('j F Y');
    }

    private function path(string $key): string
    {
        return resource_path("legal/{$key}.md");
    }

    private function placeholders(): array
    {
        $c = Company::details();
        $restricted = collect(config('countries.excluded', []))
            ->map(fn ($code) => Countries::name($code))
            ->sort()
            ->implode(', ');
        $custom = config('payments.custom');
        $dpa = $c['dpa'] ?: 'the data protection supervisory authority in the EU/EEA country where you live or work, or where the Company is established';

        $map = [
            'brand' => $c['brand'],
            'company_name' => $c['name'],
            'company_number' => $c['number'] ?: '[registration number]',
            'company_vat' => $c['vat_number'] ?: 'not VAT registered',
            'company_address' => $c['address'] ?: '[registered address]',
            'company_country' => $c['country'] ?: '[country]',
            'company_email' => $c['email'],
            'company_phone' => $c['phone'] ?: '[phone]',
            'support_hours' => $c['support_hours'],
            'jurisdiction' => $c['jurisdiction'],
            'dpa' => $dpa,
            'descriptor' => $c['descriptor'],
            'website' => $c['website'],
            'effective_date' => $this->effectiveDate(),
            'version' => (string) config('legal.version'),
            'min_age' => (string) config('legal.min_age'),
            'currency' => (string) config('payments.currency'),
            'custom_min' => Money::format($custom['min']),
            'custom_max' => Money::format($custom['max']),
            'restricted_countries' => $restricted,
            'session_cookie' => (string) config('session.cookie'),
            'session_minutes' => (string) config('session.lifetime'),
            'terms_url' => route('legal.show', 'terms'),
            'privacy_url' => route('legal.show', 'privacy'),
            'cookies_url' => route('legal.show', 'cookies'),
            'refunds_url' => route('legal.show', 'refunds'),
            'topup_url' => route('top-up'),
            'account_url' => route('account'),
        ];

        $out = [];
        foreach ($map as $key => $value) {
            $out['{{'.$key.'}}'] = $value;
        }

        return $out;
    }
}

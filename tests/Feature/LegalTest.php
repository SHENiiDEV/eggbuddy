<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegalTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_renders_with_company_details(): void
    {
        $this->get('/')->assertOk()->assertInertia(fn ($p) => $p
            ->component('Home')
            ->has('packages', 4)
            ->where('company.name', 'Test Company Ltd'));
    }

    public function test_every_policy_is_published_with_merchant_details(): void
    {
        foreach (['terms', 'privacy', 'cookies', 'refunds'] as $doc) {
            $this->get("/legal/{$doc}")->assertOk()->assertInertia(fn ($p) => $p
                ->component('Legal/Show')
                ->where('document.key', $doc)
                ->where('document.html', fn ($html) => str_contains($html, 'Test Company Ltd') && ! str_contains($html, '{{'))
                ->has('document.toc'));

            $this->get("/legal/{$doc}/pdf")->assertOk()->assertHeader('Content-Type', 'application/pdf');
        }

        $this->get('/legal/nope')->assertNotFound();
    }

    public function test_terms_cover_card_scheme_essentials(): void
    {
        $html = $this->get('/legal/terms')->viewData('page')['props']['document']['html'];

        foreach (['Delivery', 'right of withdrawal', 'Refund', 'chargeback', 'EUR', 'PCI DSS', 'subscriptions', 'Russia', 'statement'] as $needle) {
            $this->assertStringContainsStringIgnoringCase($needle, $html);
        }
    }
}

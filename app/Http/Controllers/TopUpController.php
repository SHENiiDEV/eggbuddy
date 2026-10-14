<?php

namespace App\Http\Controllers;

use App\Payments\GatewayManager;
use App\Payments\PaymentService;
use App\Support\Countries;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class TopUpController extends Controller
{
    public function __construct(
        private readonly PaymentService $payments,
        private readonly GatewayManager $gateways,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('TopUp/Index', [
            'packages' => $this->payments->packages(),
            'custom' => $this->payments->customConfig(),
            'billing' => $user->billingDetails() + ['country_name' => Countries::name($user->country)],
            'billingComplete' => $user->hasCompleteBillingProfile(),
            'gatewayAvailable' => $this->gateways->isAvailable(),
            'testMode' => $this->gateways->isAvailable() && $this->gateways->default()->isTestMode(),
            'selected' => $request->query('package'),
        ]);
    }

    public function store(Request $request): HttpResponse
    {
        $data = $request->validate([
            'package' => ['required', 'string', Rule::in([...array_keys(config('payments.packages')), 'custom'])],
            'amount' => ['nullable', 'required_if:package,custom', 'integer'],
            'accept_terms' => ['accepted'],
            'immediate_supply' => ['accepted'],
        ], [
            'accept_terms.accepted' => 'Please agree to the Terms & Conditions and Refund Policy.',
            'immediate_supply.accepted' => 'Please confirm immediate delivery of your coins to continue.',
            'amount.required_if' => 'Enter the amount you would like to top up.',
        ]);

        $quote = $this->payments->quote($data['package'], isset($data['amount']) ? (int) $data['amount'] : null);
        $payment = $this->payments->create($request->user(), $quote, $request);
        $url = $this->payments->checkout($payment);

        return Inertia::location($url);
    }
}

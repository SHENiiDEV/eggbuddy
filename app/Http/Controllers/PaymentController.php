<?php

namespace App\Http\Controllers;

use App\Billing\InvoiceService;
use App\Models\Invoice;
use App\Models\Payment;
use App\Payments\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $payments) {}

    /** Where the customer lands after the payment page. */
    public function show(Request $request, Payment $payment): Response
    {
        abort_unless($payment->user_id === $request->user()->id, 404);

        $this->payments->syncOnReturn($payment);
        $payment->refresh()->load('invoice');

        return Inertia::render('Payments/Show', [
            'payment' => $payment->toFrontend(),
            'balance' => (int) $request->user()->refresh()->coins,
        ]);
    }

    public function status(Request $request, Payment $payment): JsonResponse
    {
        abort_unless($payment->user_id === $request->user()->id, 404);
        $payment->load('invoice');

        return response()->json([
            'payment' => $payment->toFrontend(),
            'balance' => (int) $request->user()->refresh()->coins,
        ]);
    }

    public function invoice(Request $request, Invoice $invoice, InvoiceService $invoices): HttpResponse
    {
        abort_unless($invoice->user_id === $request->user()->id, 404);

        $pdf = $invoices->pdf($invoice);
        $disposition = $request->boolean('download') ? 'attachment' : 'inline';

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => $disposition.'; filename="'.$invoice->filename().'"',
            'Cache-Control' => 'private, no-store',
        ]);
    }

    /** Server-to-server notifications from the payment provider. */
    public function webhook(Request $request, string $gateway): HttpResponse
    {
        $this->payments->handleWebhook($gateway, $request);

        return response('OK', 200);
    }
}

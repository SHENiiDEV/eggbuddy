<?php

namespace App\Http\Controllers;

use App\Legal\LegalDocuments;
use App\Mail\WelcomeMail;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class LegalController extends Controller
{
    public function __construct(private readonly LegalDocuments $documents) {}

    public function show(string $document): Response
    {
        abort_unless($this->documents->exists($document), 404);

        return Inertia::render('Legal/Show', [
            'document' => $this->documents->render($document),
        ]);
    }

    public function pdf(string $document): HttpResponse
    {
        abort_unless($this->documents->exists($document), 404);

        $filename = str($this->documents->title($document))->slug().'-v'.config('legal.version').'.pdf';

        return response(WelcomeMail::legalPdf($document), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }
}

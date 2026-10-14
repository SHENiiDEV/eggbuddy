<?php

namespace App\Support;

use Dompdf\Dompdf;
use Dompdf\Options;

/** Renders a Blade view to PDF bytes with dompdf. */
class Pdf
{
    public function render(string $view, array $data = [], string $paper = 'A4'): string
    {
        $html = view($view, $data)->render();

        $fontDir = storage_path('fonts');
        if (! is_dir($fontDir)) {
            @mkdir($fontDir, 0775, true);
        }

        $options = new Options;
        $options->setDefaultFont('DejaVu Sans');
        $options->setIsRemoteEnabled(false);
        $options->setIsHtml5ParserEnabled(true);
        $options->setFontDir($fontDir);
        $options->setFontCache($fontDir);
        $options->setChroot([base_path('resources'), base_path('public')]);
        $options->setTempDir(sys_get_temp_dir());

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper($paper);
        $dompdf->render();

        $canvas = $dompdf->getCanvas();
        $font = $dompdf->getFontMetrics()->getFont('DejaVu Sans');
        $canvas->page_text($canvas->get_width() - 92, $canvas->get_height() - 46, 'Page {PAGE_NUM} of {PAGE_COUNT}', $font, 7, [0.54, 0.46, 0.58]);

        return (string) $dompdf->output();
    }
}

<?php

namespace App\Payments;

use App\Payments\Contracts\PaymentGateway;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GatewayManager
{
    /** @var array<string, PaymentGateway> */
    private array $resolved = [];

    public function defaultKey(): string
    {
        return (string) config('payments.default', 'demo');
    }

    public function default(): PaymentGateway
    {
        return $this->get($this->defaultKey());
    }

    public function get(string $key): PaymentGateway
    {
        if (isset($this->resolved[$key])) {
            return $this->resolved[$key];
        }

        $config = config("payments.gateways.{$key}");
        if (! $config || ! ($config['enabled'] ?? true) || empty($config['class'])) {
            throw new NotFoundHttpException("Payment gateway [{$key}] is not available.");
        }

        return $this->resolved[$key] = app()->make($config['class'], ['config' => $config, 'key' => $key]);
    }

    public function isAvailable(): bool
    {
        try {
            $this->default();

            return true;
        } catch (NotFoundHttpException) {
            return false;
        }
    }
}

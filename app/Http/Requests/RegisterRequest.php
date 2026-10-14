<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\PersonalDetailsRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    use PersonalDetailsRules;

    protected function prepareForValidation(): void
    {
        $this->normalizePersonalDetails();
    }

    public function rules(): array
    {
        return $this->personalDetailsRules() + [
            'password' => ['required', 'confirmed', Password::defaults()],
            'terms' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return $this->personalDetailsMessages() + [
            'terms.accepted' => 'Please agree to the Terms & Conditions and Privacy Policy to continue.',
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\PersonalDetailsRules;
use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
{
    use PersonalDetailsRules;

    protected function prepareForValidation(): void
    {
        $this->normalizePersonalDetails();
    }

    public function rules(): array
    {
        return $this->personalDetailsRules($this->user()->id);
    }

    public function messages(): array
    {
        return $this->personalDetailsMessages();
    }
}

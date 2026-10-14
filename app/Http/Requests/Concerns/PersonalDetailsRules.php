<?php

namespace App\Http\Requests\Concerns;

use App\Support\Countries;
use Illuminate\Validation\Rule;

/**
 * Personal and billing details shared by sign-up and profile editing. The
 * payment provider rejects card payments without them, so they are all
 * required and validated the same way everywhere.
 */
trait PersonalDetailsRules
{
    protected function normalizePersonalDetails(): void
    {
        $phone = (string) $this->input('phone', '');
        $phone = preg_replace('/[\s().\-\/]/', '', $phone);
        if (str_starts_with($phone, '00')) {
            $phone = '+'.substr($phone, 2);
        }

        $trim = fn ($v) => is_string($v) ? trim(preg_replace('/\s+/u', ' ', $v)) : $v;

        $this->merge(array_filter([
            'first_name' => $trim($this->input('first_name')),
            'last_name' => $trim($this->input('last_name')),
            'email' => is_string($this->input('email')) ? mb_strtolower(trim($this->input('email'))) : $this->input('email'),
            'phone' => $phone,
            'address_line' => $trim($this->input('address_line')),
            'city' => $trim($this->input('city')),
            'country' => is_string($this->input('country')) ? strtoupper(trim($this->input('country'))) : $this->input('country'),
            'postcode' => is_string($this->input('postcode')) ? strtoupper($trim($this->input('postcode'))) : $this->input('postcode'),
        ], fn ($v) => $v !== null));
    }

    protected function personalDetailsRules(?int $ignoreUserId = null): array
    {
        $minAge = (int) config('legal.min_age', 18);
        $name = ['required', 'string', 'max:60', "regex:/^[\pL\pM][\pL\pM\s'.\-]*$/u"];

        return [
            'first_name' => $name,
            'last_name' => $name,
            'email' => ['required', 'string', 'email:rfc', 'max:255', Rule::unique('users', 'email')->ignore($ignoreUserId)],
            'phone' => ['required', 'string', 'regex:/^\+[1-9]\d{6,14}$/'],
            'date_of_birth' => [
                'required',
                'date_format:Y-m-d',
                'after:1900-01-01',
                'before_or_equal:'.now()->subYears($minAge)->toDateString(),
            ],
            'address_line' => ['required', 'string', 'min:3', 'max:160'],
            'city' => ['required', 'string', 'max:80'],
            'country' => ['required', 'string', 'size:2', Rule::in(Countries::codes())],
            'postcode' => ['required', 'string', 'max:20', 'regex:/^[A-Z0-9][A-Z0-9 \-]{1,18}$/'],
        ];
    }

    protected function personalDetailsMessages(): array
    {
        return [
            'first_name.regex' => 'Please use letters only.',
            'last_name.regex' => 'Please use letters only.',
            'phone.regex' => 'Enter your phone in international format, e.g. +371 20 000 000.',
            'date_of_birth.before_or_equal' => 'You must be at least '.config('legal.min_age', 18).' years old to use '.config('app.name').'.',
            'date_of_birth.after' => 'Please enter a valid date of birth.',
            'date_of_birth.date_format' => 'Please enter a valid date of birth.',
            'country.in' => 'Unfortunately we cannot accept customers from this country.',
            'postcode.regex' => 'Please enter a valid post code.',
            'email.unique' => 'An account with this email already exists.',
        ];
    }

    public function attributes(): array
    {
        return [
            'first_name' => 'name',
            'last_name' => 'surname',
            'address_line' => 'street address',
            'postcode' => 'post code',
            'date_of_birth' => 'date of birth',
        ];
    }
}

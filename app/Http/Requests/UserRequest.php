<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? null;
        $isCreate = $this->isMethod('post');

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password' => [$isCreate ? 'required' : 'nullable', 'string', 'min:8', 'confirmed'],
            'avatar' => ['nullable', 'image', 'max:2048'],
            'selectedRoles' => ['required', 'array', 'min:1'],
            'selectedRoles.*' => ['string', 'exists:roles,name'],
            'store_id' => [$isCreate ? 'required' : 'nullable'],
            'plan_id' => ['nullable', 'exists:plans,id'],
            'store_role' => ['nullable', 'string', 'max:50'],
        ];

        if ($isCreate) {
            $rules['new_store_name'] = ['required_if:store_id,new', 'string', 'max:255'];
        }

        return $rules;
    }
}

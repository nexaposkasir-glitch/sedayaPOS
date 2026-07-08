<?php

namespace Tests;

use App\Models\Store;
use App\Models\User;
use App\Support\BotGuard;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Crypt;

abstract class TestCase extends BaseTestCase
{
    /** @var Store|null */
    protected static ?Store $testStore = null;

    protected function botGuardPayload(): array
    {
        $payload = BotGuard::payload();

        return [
            $payload['honeypot_field'] => '',
            $payload['token_field'] => Crypt::encryptString(json_encode([
                'iat' => now()->subSeconds(max(3, config('security.bot_guard.min_submit_seconds', 2) + 1))->timestamp,
                'nonce' => 'test-nonce',
            ], JSON_THROW_ON_ERROR)),
        ];
    }

    protected function recentlyConfirmedSession(): array
    {
        return [
            'auth.password_confirmed_at' => time(),
        ];
    }

    /**
     * Get or create a shared test store for tests that need multi-tenant isolation.
     */
    protected function getTestStore(): Store
    {
        if (self::$testStore && ! self::$testStore->trashed()) {
            return self::$testStore;
        }

        self::$testStore = Store::create([
            'name' => 'Test Store',
            'is_active' => true,
            'subscription_status' => 'active',
            'trial_ends_at' => now()->addMonth(),
            'subscription_ends_at' => now()->addMonth(),
        ]);

        return self::$testStore;
    }

    /**
     * Create a test user with super-admin role for a specific store.
     * Bypasses global scope so the user can see all test data.
     */
    protected function createTestUser(array $attributes = []): User
    {
        $store = $this->getTestStore();

        return User::withoutGlobalScopes()->create(array_merge([
            'name' => 'Test User',
            'email' => 'testuser_'.uniqid().'@example.com',
            'password' => bcrypt('password'),
            'store_id' => $store->id,
            'email_verified_at' => now(),
        ], $attributes));
    }
}

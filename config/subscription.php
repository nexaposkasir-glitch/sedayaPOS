<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Subscription Grace Period
    |--------------------------------------------------------------------------
    |
    | Number of days after subscription expiry during which the store can
    | still access the system in read-only / limited mode before full lockout.
    |
    */
    'grace_period_days' => env('SUBSCRIPTION_GRACE_PERIOD_DAYS', 7),

    /*
    |--------------------------------------------------------------------------
    | Default Trial Days
    |--------------------------------------------------------------------------
    |
    | Default trial period for newly registered stores.
    |
    */
    'trial_days' => env('SUBSCRIPTION_TRIAL_DAYS', 30),

    /*
    |--------------------------------------------------------------------------
    | Duration Options
    |--------------------------------------------------------------------------
    |
    | Available billing cycle options for subscription activation.
    |
    */
    'duration_options' => [
        1 => '1 Bulan',
        3 => '3 Bulan',
        6 => '6 Bulan',
        12 => '12 Bulan',
    ],
];

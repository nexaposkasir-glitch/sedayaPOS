<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('plans')->cascadeOnDelete();
            $table->string('gateway'); // midtrans, xendit
            $table->string('external_id')->unique(); // order_id/invoice_id dari payment gateway
            $table->unsignedBigInteger('amount');
            $table->string('status')->default('pending'); // pending, paid, expired, failed, cancelled
            $table->string('payment_url')->nullable();
            $table->json('payment_data')->nullable(); // raw response dari gateway
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_payments');
    }
};

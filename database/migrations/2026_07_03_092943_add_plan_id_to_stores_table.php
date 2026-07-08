<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->foreignId('plan_id')->nullable()->after('id')->constrained('plans')->nullOnDelete();
            $table->string('subscription_status')->default('trial')->after('subscription_ends_at'); // trial, active, past_due, cancelled, expired
            $table->timestamp('cancelled_at')->nullable()->after('subscription_status');
            $table->boolean('auto_renew')->default(false)->after('cancelled_at');
            $table->timestamp('last_payment_at')->nullable()->after('auto_renew');
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropForeign(['plan_id']);
            $table->dropColumn(['plan_id', 'subscription_status', 'cancelled_at', 'auto_renew', 'last_payment_at']);
        });
    }
};

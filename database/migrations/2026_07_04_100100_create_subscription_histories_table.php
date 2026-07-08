<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained('plans')->nullOnDelete();
            $table->string('action'); // activated, changed, extended, suspended, resumed, cancelled, manual_activated
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::table('subscription_payments', function (Blueprint $table) {
            $table->text('notes')->nullable()->after('gateway');
            $table->integer('duration_months')->default(1)->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('subscription_payments', function (Blueprint $table) {
            $table->dropColumn(['notes', 'duration_months']);
        });
        Schema::dropIfExists('subscription_histories');
    }
};

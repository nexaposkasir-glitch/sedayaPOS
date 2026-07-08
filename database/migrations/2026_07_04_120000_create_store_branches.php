<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pivot: many-to-many between users and stores
        Schema::create('store_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->string('role')->default('admin'); // owner, admin, cashier
            $table->timestamps();

            $table->unique(['user_id', 'store_id']);
        });

        // Branch hierarchy
        Schema::table('stores', function (Blueprint $table) {
            $table->foreignId('parent_store_id')->nullable()->after('plan_id')
                ->constrained('stores')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_store_id');
        });
        Schema::dropIfExists('store_user');
    }
};

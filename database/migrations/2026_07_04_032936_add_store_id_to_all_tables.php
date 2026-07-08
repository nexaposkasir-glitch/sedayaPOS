<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds store_id to all business data tables for multi-tenant isolation.
     * Each table's store_id references the stores.id it belongs to.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('product_warehouse', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('product_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('warehouses', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('cashier_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
            $table->index(['store_id', 'created_at']);
        });

        Schema::table('transaction_details', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('transaction_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('cashier_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('cashier_shifts', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('warehouse_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('receivables', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('customer_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('payables', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('supplier_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('customer_vouchers', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('customer_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('sales_returns', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('transaction_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('supplier_returns', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('supplier_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('supplier_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('goods_receivings', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('purchase_order_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('stock_opnames', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('warehouse_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('stock_mutations', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('product_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('pricing_rules', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('payment_settings', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('user_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('customer_campaigns', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });

        Schema::table('customer_campaign_logs', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('customer_campaign_id')->constrained('stores')->nullOnDelete();
            $table->index('store_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'suppliers', 'customer_campaigns', 'customer_campaign_logs', 'audit_logs', 'payment_settings', 'bank_accounts',
            'pricing_rules', 'stock_mutations', 'stock_opnames', 'goods_receivings',
            'purchase_orders', 'supplier_returns', 'sales_returns', 'customer_vouchers',
            'payables', 'receivables', 'cashier_shifts', 'carts', 'transaction_details',
            'transactions', 'warehouses', 'customers', 'product_warehouse', 'products', 'categories',
        ];

        foreach ($tables as $table) {
            if (Schema::hasColumn($table, 'store_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropForeign(['store_id']);
                    $table->dropColumn('store_id');
                });
            }
        }
    }
};

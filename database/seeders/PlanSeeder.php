<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Gratis',
                'slug' => 'free',
                'description' => 'Untuk memulai bisnis kecil. Akses fitur dasar POS.',
                'monthly_price' => 0,
                'yearly_price' => 0,
                'features' => [
                    'pos_transactions',
                    'product_management',
                    'customer_management',
                    'basic_reports',
                    'email_support',
                ],
                'limits' => [
                    'max_products' => 100,
                    'max_users' => 2,
                    'max_transactions_per_month' => 500,
                    'max_stores' => 1,
                ],
                'sort_order' => 1,
                'is_active' => true,
                'is_default' => true,
            ],
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'Untuk bisnis menengah. Fitur lengkap dengan laporan lanjutan.',
                'monthly_price' => 99000,
                'yearly_price' => 990000,
                'features' => [
                    'pos_transactions',
                    'product_management',
                    'customer_management',
                    'advanced_reports',
                    'inventory_management',
                    'purchase_orders',
                    'stock_opname',
                    'sales_returns',
                    'loyalty_program',
                    'whatsapp_notifications',
                    'priority_support',
                ],
                'limits' => [
                    'max_products' => 1000,
                    'max_users' => 5,
                    'max_transactions_per_month' => 5000,
                    'max_stores' => 2,
                ],
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'Untuk bisnis berkembang. Semua fitur + CRM & multi-gudang.',
                'monthly_price' => 249000,
                'yearly_price' => 2490000,
                'features' => [
                    'pos_transactions',
                    'product_management',
                    'customer_management',
                    'advanced_reports',
                    'inventory_management',
                    'purchase_orders',
                    'stock_opname',
                    'sales_returns',
                    'loyalty_program',
                    'crm_automation',
                    'whatsapp_notifications',
                    'multi_warehouse',
                    'stock_transfers',
                    'composite_products',
                    'price_lists',
                    'batch_tracking',
                    'priority_support',
                ],
                'limits' => [
                    'max_products' => 5000,
                    'max_users' => 15,
                    'max_transactions_per_month' => null,
                    'max_stores' => 5,
                ],
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Untuk bisnis besar. Unlimited + API access & dedicated support.',
                'monthly_price' => 499000,
                'yearly_price' => 4990000,
                'features' => [
                    'pos_transactions',
                    'product_management',
                    'customer_management',
                    'advanced_reports',
                    'inventory_management',
                    'purchase_orders',
                    'stock_opname',
                    'sales_returns',
                    'loyalty_program',
                    'crm_automation',
                    'whatsapp_notifications',
                    'multi_warehouse',
                    'stock_transfers',
                    'composite_products',
                    'price_lists',
                    'batch_tracking',
                    'api_access',
                    'custom_integration',
                    'white_label',
                    'dedicated_support',
                ],
                'limits' => [
                    'max_products' => null,
                    'max_users' => null,
                    'max_transactions_per_month' => null,
                    'max_stores' => null,
                ],
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}

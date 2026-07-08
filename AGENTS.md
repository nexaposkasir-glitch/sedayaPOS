# AGENTS.md — Point of Sales

Open-source POS system (200+ stars). Laravel 12 + Inertia 2.0 + React 18.

## Important: This Repo

**Remote:** `git@github.com:aryadwiputra/point-of-sales.git`

**Branch structure:**
- `main` — production. Protected. PR only from `development`.
- `development` — integration branch. Feature branches merge here via PR.
- `release/*` — release candidates. Created from `development`, merged to `main` + tagged.
- `revamp-frontend` — legacy UI overhaul branch (inactive).
- `feature/*` — individual feature work. Branch from `development`, PR to `development`.
- `fix/*` — hotfixes. Branch from `main`, PR to `main` + `development`.

**Tags follow semver:** `v1.0.0`, `v2.1.0`, etc.

## Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: Inertia.js 2.0 + React 18, Vite 5
- **Styling**: Tailwind CSS 3 (custom theme in `tailwind.config.js`)
- **Auth/RBAC**: Spatie Laravel Permission + Laravel Breeze
- **DB**: MySQL (default); SQLite in-memory for tests
- **Payment gateways**: Midtrans, Xendit (webhooks in `routes/api.php`)
- **WhatsApp**: whatsapp-web.js via separate Node service (`whatsapp-service/`)

## Developer Commands

```bash
# Initial setup
cp .env.example .env
composer install && npm install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# Dev servers — run BOTH
npm run dev          # Vite HMR
php artisan serve    # Laravel

# Testing
php artisan test                     # all
php artisan test --filter=FooTest    # one class
php artisan test --filter=test_name  # one method

# WhatsApp Service (separate terminal)
cd whatsapp-service
npm install && npm start             # port 3001

# PM2 for production
pm2 start whatsapp-service/server.js --name wa-service

# Import/Export
php artisan make:export ProductsExport --model=Product
php artisan make:import ProductsImport --model=Product

# Formatting
vendor/bin/pint

# Production build
npm run build
```

## Architecture

- **Controllers**: `app/Http/Controllers/Apps/` — per-module controllers
- **Services**: `app/Services/` — business logic: AuditLog, CashierShift, StockMutation, Payments/, PricingService, CrmAutomationService, etc.
- **Layouts**: `POSLayout.jsx` (POS), `DashboardLayout.jsx` (admin), `AuthenticatedLayout.jsx` (profile), `GuestLayout.jsx` (auth)
- **Routes**: `routes/web.php` (~50+ dashboard routes), `routes/api.php` (webhooks), `routes/auth.php` (Breeze)
- **Inertia shared props**: `HandleInertiaRequests.php` — auth, permissions, notifications (low stock, receivables, payables aging), active shift, store profile, appVersion
- **Services**: `app/Services/` — ~21 services, latest: WhatsAppService (HTTP wrapper to Node)

## Middleware

| Alias | Class | Applied to |
|-------|-------|------------|
| `permission` | Spatie PermissionMiddleware | Every dashboard route |
| `step_up` | EnsureRecentPasswordConfirmation | Sensitive create/update/delete: roles, users, payment settings, bank accounts, payment confirm |
| `active_shift` | EnsureActiveCashierShift | All POS transaction actions (cart CRUD, hold/resume, checkout) |
| `bot.guard` | EnsureBotGuard | Login/register/forgot-password (honeypot + timer) |
| `registration.enabled` | EnsurePublicRegistrationEnabled | Register route (default: off) |

## Seeder Chain

`DatabaseSeeder` runs in exact order with permission cache reset before & after:

```
PermissionSeeder → RoleSeeder → UserSeeder → PaymentSettingSeeder → SampleDataSeeder → OperationalCoreSeeder → FeatureCoverageSeeder
```

**Default users:** `kseduh5@gmail.com` / `password` (admin/super-admin), `arya@gmail.com` / `password` (admin, for tests), `cashier@gmail.com` / `password` (cashier)

## Critical Gotchas

1. **Permission cache stale after seed** — logout + login again. Seeder resets cache but session still holds old permissions.
2. **Webhooks need public APP_URL** — Midtrans/Xendit won't work with localhost.
3. **Product images need storage:link** — `php artisan storage:link` or images won't render.
4. **Missing migrations cause 500 on new modules** — run `php artisan migrate` for newer modules (purchase orders, goods receiving, supplier returns, stock opname, etc.).
5. **Tests force SQLite in-memory** — `phpunit.xml` sets `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`. Don't assume MySQL features. **Set `tax_rate=0` on test Product::create** to avoid PPN changing grand_total.
6. **Both dev servers required** — Vite serves JS/CSS via HMR. `php artisan serve` alone won't work.
7. **WhatsApp service separate** — `whatsapp-service/` needs `npm start` in another terminal + `WA_SERVICE_URL` in .env
8. **CRM campaign auto-send** — requires `wa_enabled=true` + connected device in Settings > WhatsApp
9. **Version bump on release** — update `APP_VERSION` in `.env` + `.env.example` when tagging

## Release Process

1. `development` accumulates features → branch `release/X.Y.Z`
2. QA/fix on `release/X.Y.Z` → merge to `main`
3. Tag: `git tag -a vX.Y.Z -m "vX.Y.Z"` on `main`
4. Merge `release/X.Y.Z` back to `development`
5. GitHub Release created from tag

## Frontend

- **Icons**: `@tabler/icons-react`
- **Alerts/confirm**: `react-hot-toast` + `sweetalert2`
- **Charts**: `chart.js`
- **Routing**: Ziggy `route()` helper available
- **Tailwind tokens**: `primary` (indigo), `accent` (cyan), `success` (emerald), `warning` (amber), `danger` (rose)

## Docs

- Modules: `docs/features/`
- Architecture: `docs/architecture-overview.md`
- Config: `docs/configuration.md`
- Planning: `planning/improvement-planning.md`

## AI Agent Rules

**Every AI agent working on this codebase MUST follow these rules. Violating any of these will cause regressions or broken features.**

**⚠️ PROJECT DIRECTION**: This project is being transformed from a **single-store POS** into a **multi-tenant SaaS POS** (many stores on one deployment, subscription-based). The current state is single-store. All code changes must be compatible with the future multi-tenant architecture. See Rule 12 (Multi-Tenant Readiness) below.

**Rebranding**: The application is now branded as **SedayaPOS**. "Malino_Seduh" is the creator/copyright holder only.

### 1. Read Before Modify

- NEVER edit a file without reading it first. Understand what it does, its dependencies, and its callers.
- Use `Grep` or `SearchCodebase` to find all usages before renaming, deleting, or changing a signature.
- Check both PHP (backend) and JSX (frontend) — they are tightly coupled via Inertia props and Ziggy routes.

### 2. Backend ↔ Frontend Consistency

- If you change a controller response (props, keys, data shape), update the corresponding React page to match.
- If you add/change/remove a route, run `php artisan ziggy:generate` so the frontend `route()` helper stays in sync.
- If you add a new Inertia page, ensure it has a `.layout` assignment using the correct layout component.

### 3. Do NOT Break Existing Features

- Existing modules (products, transactions, customers, POS, reports, purchase orders, stock opname, etc.) must keep working.
- When adding a migration, NEVER modify an existing migration file — always create a NEW migration.
- When adding a column to a table, provide a safe default or make it nullable unless absolutely required.
- Do NOT remove or rename existing permissions — Spatie caches them and existing roles rely on them.

### 4. Middleware & Permission Awareness

- Dashboard routes require `permission` middleware with the correct permission name.
- POS transaction routes require `active_shift` middleware.
- Sensitive actions (roles, users, payment settings) require `step_up` middleware.
- When adding a new controller method that needs a permission check, register the permission in `PermissionSeeder` and add it to the route group.

### 5. Database Safety

- Always use `Schema::hasTable()` / `Schema::hasColumn()` before altering in seeders that may run before migrations.
- MySQL is the production database. Do NOT use SQLite-specific syntax or features.
- Use `DB::transaction()` for multi-table writes that must be atomic.
- Seeder uses `firstOrCreate()` / `updateOrCreate()` to be idempotent — follow this pattern.

### 6. Error-Free Guarantee

- After making changes, run `php artisan test` to verify nothing is broken.
- If you added frontend changes, verify `npm run build` compiles without errors.
- If you modified routes, verify `php artisan route:list` shows no conflicts.
- If you modified migrations, run `php artisan migrate:fresh --seed` at least once to verify the full chain works.

### 7. File Structure Conventions

| What | Where |
|------|-------|
| Backend controllers | `app/Http/Controllers/Apps/{Module}Controller.php` |
| Services (business logic) | `app/Services/{ServiceName}.php` |
| Frontend pages | `resources/js/Pages/Dashboard/{Module}/` |
| Frontend layouts | `resources/js/Layouts/` |
| Database migrations | `database/migrations/{timestamp}_{description}.php` |
| Seeders | `database/seeders/{Name}Seeder.php` |
| Models | `app/Models/{Name}.php` |

### 8. React / Inertia Conventions

- Always assign `.layout` on page components — pages without layout will crash.
- Use `usePage()` to access shared props (auth, permissions, notifications).
- Use `route()` from Ziggy for all URL generation, never hardcode paths.
- Use `@tabler/icons-react` for icons, not raw SVGs or other icon packs.
- For confirmation dialogs use `sweetalert2`, for toasts use `react-hot-toast`.

### 9. Validation & Error Handling

- Always validate user input in controllers with `$request->validate()`.
- Never trust client-side data — backend validation is mandatory.
- Return proper Inertia error responses, not raw 500 pages.
- Catch exceptions in service methods and re-throw with meaningful messages.

### 10. Performance & Scalability

- Use eager loading (`with()`) for relationships to avoid N+1 queries.
- Use `cursor()` or `chunk()` for processing large datasets in seeders/jobs.
- Keep Inertia shared props light — heavy queries in `HandleInertiaRequests` slow every page load.

### 11. Design Consistency & Responsiveness

- **Desktop + Mobile parity**: Every page and component MUST work on both desktop and mobile. No feature hidden or broken at any breakpoint. Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) consistently.
- **Layout consistency**: Follow existing layout patterns. Dashboard pages use `DashboardLayout.jsx`, POS flow uses `POSLayout.jsx`. Do NOT create ad-hoc layouts or inline page wrappers.
- **Spacing & sizing tokens**: Use Tailwind's built-in spacing scale (`p-4`, `m-2`, `gap-6`, etc.). Do NOT invent arbitrary pixel values like `px-[17px]` unless absolutely unavoidable.
- **Color tokens**: Use the project's Tailwind theme tokens — `primary` (indigo), `accent` (cyan), `success` (emerald), `warning` (amber), `danger` (rose). Do NOT hardcode hex colors.
- **Component reuse**: Before building a new UI component, check `resources/js/Components/` for existing reusable components. Prefer reuse over duplication.
- **Form patterns**: All forms follow the same structure as existing Dashboard forms — consistent label/input spacing, validation error display, and submit button placement.
- **Mobile navigation**: Sidebar collapses to hamburger on mobile. Bottom nav or fixed header may complement it. Ensure touch targets are at least `min-h-[44px] min-w-[44px]` on mobile.
- **Tables on mobile**: Use horizontal scroll wrapper (`overflow-x-auto`) for wide data tables. Do NOT hide columns arbitrarily — the user should still be able to scroll to see all data.
- **Modals & dialogs**: Use `sweetalert2` for confirmations, not custom modals. For custom modals, ensure they are fully responsive and closeable on mobile (tap outside, close button visible).
- **Typography scale**: Use Tailwind's default type scale. Headings: `text-lg`/`text-xl`/`text-2xl`. Body: `text-sm`/`text-base`. Never go below `text-xs` for readability.
- **Dark/light consistency** (if applicable): If the page supports dark mode, ensure all sections (cards, inputs, modals, dropdowns) follow the same scheme. Test both modes.

### 12. Multi-Tenant Readiness (CRITICAL)

This project is transitioning to multi-tenant SaaS. Until the migration is complete, ALL agents MUST follow these rules to avoid breaking the future architecture and to ensure data isolation:

#### 12a. Assume store_id Will Exist

- When writing ANY query that touches business data (products, customers, transactions, etc.), mentally add "WHERE store_id = ?".
- Do NOT write queries that assume all data is globally shared without a store scope.
- Even though `store_id` doesn't exist yet, write code as if it does — use scoped queries.

#### 12b. Do NOT Add store_id Prematurely

- Do NOT add `store_id` columns or create migration files for multi-tenant without explicit approval.
- The multi-tenant migration must be done in ONE coordinated phase, not piecemeal.
- Adding partial migrations will create chaos and break existing functionality.

#### 12c. Registration Flow

- The `RegisteredUserController` is planned to auto-create a Store record. Do NOT modify its logic without discussing the multi-tenant impact.
- New users currently get role `cashier`. In the future, the first user of each store gets `super-admin` role scoped to their store.

#### 12d. Data Isolation Awareness

- **Products, Customers, Warehouses, Settings** — currently global, will be scoped per store. New code should be written with filterable queries (e.g., pass `$storeId` as parameter even if hardcoded for now).
- **Transactions, Carts** — already scoped per `cashier_id`. Will be scoped per `store_id` in addition.
- **Users** — remain global (one user can belong to one store via `store_id` on users table or pivot). Roles/permissions will eventually be scoped per store.

#### 12e. Settings Migration Path

- Settings are currently in a global key-value `settings` table.
- In multi-tenant, settings will move to a JSON column on the `stores` table (`stores.settings_json`).
- Do NOT add new settings keys without documenting them. All new settings must be planned for the JSON migration.
- Use the existing `Setting::get()` / `Setting::set()` pattern — it will be refactored to accept `$storeId` later.

#### 12f. Testing & Multi-Tenant

- When writing tests, be aware that tests currently run as single-store.
- Do NOT write tests that depend on global data visibility that would fail under multi-tenant scoping.
- Tests using `arya@gmail.com` (super-admin) can see all data — this pattern will remain for global admins. Tests using `cashier@gmail.com` should only see their own transactions.

#### 12g. Frontend Awareness

- The sidebar shows `storeProfile.name` from settings. In multi-tenant, this will come from the `stores` table.
- All components using `storeProfile` props must remain compatible with the future data source.
- Rebranding elements (logo, store name, copyright) are already done. Do NOT add "Malino_Seduh" as app name anywhere — it's the creator credit only (footer).

#### 12h. Subscription-Protected Features

- In the future, certain features will be gated by subscription plan (max products, max users, advanced reports).
- Do NOT add hardcoded feature flags. If you need to gate a feature, use a config key or setting so it can be replaced with plan-based gating later.

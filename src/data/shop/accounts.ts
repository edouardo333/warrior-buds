// Storefront — customer account seed. Intentionally empty: real accounts
// are only ever created client-side through the sign-up flow (see
// lib/shop/auth-engine.ts) and persisted by data/shop/account-store.ts.
// Never imports from or writes to data/bud-guardian/**.

import type { CustomerAccount } from "@/types/account";

export const SHOP_ACCOUNTS: CustomerAccount[] = [];

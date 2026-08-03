// Storefront — Customer Account types. Fully separate from the CRM's derived
// CustomerProfile (types/customer.ts, built by clustering the staff order
// book) and from staff auth (lib/staff/staff-auth.ts) — this is a real,
// explicit customer-created account record, simulated entirely client-side
// (see data/shop/account-store.ts). Never imports from or writes to
// data/bud-guardian/**, lib/staff/**, or components/staff/**.

export type Address = {
  id: string;
  label: string; // e.g. "Home", "Work"
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

export type PaymentPreference = {
  id: string;
  providerId: string; // matches PaymentProviderAdapter["id"] in types/shop-payment.ts
  label: string; // e.g. "Interac — my.email@example.com"
  isDefault: boolean;
};

export type CustomerAccount = {
  id: string; // synthetic, e.g. "ACC-10234"
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Simulated, non-cryptographic — see lib/shop/auth-engine.ts hashPassword().
  // This is a demo build with no real backend; never treat as secure storage.
  passwordHash: string;
  emailVerified: boolean;
  marketingOptIn: boolean;
  createdAt: string;
  updatedAt: string;
  addresses: Address[];
  paymentPreferences: PaymentPreference[];
};

// Minimal, non-sensitive session payload — mirrors the "small session
// object" guidance the rest of the app already follows in staff-auth.ts's
// StaffSession, just persisted to localStorage instead of sessionStorage so
// it survives across browser restarts ("Persistent sessions").
export type AccountSession = {
  accountId: string;
  email: string;
  firstName: string;
  issuedAt: string;
};

export type AuthTokenPurpose = "verify-email" | "reset-password";

// Simulated single-use tokens for the email-verification and
// forgot/reset-password flows. In this mock build the token is only ever
// displayed on-screen (see lib/shop/mock-email.ts) instead of actually
// emailed, since there is no real mail transport.
export type AuthToken = {
  token: string;
  accountId: string;
  purpose: AuthTokenPurpose;
  expiresAt: string;
  usedAt: string | null;
};

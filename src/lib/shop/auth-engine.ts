// Storefront — auth business rules: signup/login/logout/verify/reset. Pure
// functions over data/shop/account-store.ts. Passwords are hashed with a
// small non-cryptographic mock digest — this is a demo build with no real
// backend, never treat this as secure storage. Never imports from or
// writes to data/bud-guardian/**, lib/staff/**, or components/staff/**.

import type { Address, AccountSession, AuthToken, CustomerAccount, PaymentPreference } from "@/types/account";
import {
  addAccount,
  addToken,
  findAccountByEmail,
  findAccountById,
  findToken,
  markTokenUsed,
  replaceAccount,
  setSession,
} from "@/data/shop/account-store";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Simulated, non-cryptographic digest — enough to avoid storing plaintext
// passwords in localStorage for a demo. Not a substitute for real hashing
// (bcrypt/argon2) behind a real backend.
export function hashPassword(password: string): string {
  const salted = `wb-storefront::${password}`;
  let hash = 0;
  for (let i = 0; i < salted.length; i += 1) {
    hash = (hash << 5) - hash + salted.charCodeAt(i);
    hash |= 0;
  }
  return `h${Math.abs(hash).toString(36)}${salted.length}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function toSession(account: CustomerAccount): AccountSession {
  return { accountId: account.id, email: account.email, firstName: account.firstName, issuedAt: new Date().toISOString() };
}

export type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  marketingOptIn: boolean;
};

export type AuthResult<T> = { ok: true; data: T } | { ok: false; error: string };

function issueToken(accountId: string, purpose: AuthToken["purpose"]): string {
  const token: AuthToken = {
    token: uid("tok").toUpperCase(),
    accountId,
    purpose,
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
    usedAt: null,
  };
  addToken(token);
  return token.token;
}

export function signUp(input: SignUpInput): AuthResult<{ account: CustomerAccount; verificationToken: string }> {
  if (findAccountByEmail(input.email)) {
    return { ok: false, error: "email-taken" };
  }
  const now = new Date().toISOString();
  const account: CustomerAccount = {
    id: uid("ACC"),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    passwordHash: hashPassword(input.password),
    emailVerified: false,
    marketingOptIn: input.marketingOptIn,
    createdAt: now,
    updatedAt: now,
    addresses: [],
    paymentPreferences: [],
  };
  addAccount(account);
  setSession(toSession(account));
  const verificationToken = issueToken(account.id, "verify-email");
  return { ok: true, data: { account, verificationToken } };
}

export function login(email: string, password: string): AuthResult<{ account: CustomerAccount }> {
  const account = findAccountByEmail(email);
  if (!account || !verifyPassword(password, account.passwordHash)) {
    return { ok: false, error: "invalid-credentials" };
  }
  setSession(toSession(account));
  return { ok: true, data: { account } };
}

export function logout(): void {
  setSession(null);
}

export function requestEmailVerification(accountId: string): string {
  return issueToken(accountId, "verify-email");
}

export function confirmEmailVerification(tokenValue: string): AuthResult<{ account: CustomerAccount }> {
  const token = findToken(tokenValue);
  if (!token || token.purpose !== "verify-email") return { ok: false, error: "invalid-token" };
  if (token.usedAt) return { ok: false, error: "token-used" };
  if (new Date(token.expiresAt).getTime() < Date.now()) return { ok: false, error: "token-expired" };
  const account = replaceAccount(token.accountId, (a) => ({ ...a, emailVerified: true, updatedAt: new Date().toISOString() }));
  if (!account) return { ok: false, error: "account-not-found" };
  markTokenUsed(tokenValue);
  return { ok: true, data: { account } };
}

export function requestPasswordReset(email: string): AuthResult<{ token: string; accountId: string }> {
  const account = findAccountByEmail(email);
  if (!account) return { ok: false, error: "not-found" };
  return { ok: true, data: { token: issueToken(account.id, "reset-password"), accountId: account.id } };
}

export function resetPassword(tokenValue: string, newPassword: string): AuthResult<{ account: CustomerAccount }> {
  const token = findToken(tokenValue);
  if (!token || token.purpose !== "reset-password") return { ok: false, error: "invalid-token" };
  if (token.usedAt) return { ok: false, error: "token-used" };
  if (new Date(token.expiresAt).getTime() < Date.now()) return { ok: false, error: "token-expired" };
  const account = replaceAccount(token.accountId, (a) => ({
    ...a,
    passwordHash: hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
  }));
  if (!account) return { ok: false, error: "account-not-found" };
  markTokenUsed(tokenValue);
  return { ok: true, data: { account } };
}

export function updateProfile(
  accountId: string,
  input: { firstName: string; lastName: string; phone: string }
): CustomerAccount | undefined {
  return replaceAccount(accountId, (a) => ({ ...a, ...input, updatedAt: new Date().toISOString() }));
}

export function updateMarketingOptIn(accountId: string, marketingOptIn: boolean): CustomerAccount | undefined {
  return replaceAccount(accountId, (a) => ({ ...a, marketingOptIn, updatedAt: new Date().toISOString() }));
}

export function changePassword(
  accountId: string,
  currentPassword: string,
  newPassword: string
): AuthResult<{ account: CustomerAccount }> {
  const account = findAccountById(accountId);
  if (!account || !verifyPassword(currentPassword, account.passwordHash)) {
    return { ok: false, error: "invalid-current-password" };
  }
  const updated = replaceAccount(accountId, (a) => ({ ...a, passwordHash: hashPassword(newPassword), updatedAt: new Date().toISOString() }));
  if (!updated) return { ok: false, error: "account-not-found" };
  return { ok: true, data: { account: updated } };
}

export function addAddress(accountId: string, input: Omit<Address, "id">): CustomerAccount | undefined {
  return replaceAccount(accountId, (a) => {
    const id = uid("ADDR");
    const isDefault = input.isDefault || a.addresses.length === 0;
    const addresses = isDefault ? a.addresses.map((x) => ({ ...x, isDefault: false })) : a.addresses;
    return { ...a, addresses: [...addresses, { ...input, id, isDefault }], updatedAt: new Date().toISOString() };
  });
}

export function updateAddress(accountId: string, addressId: string, input: Omit<Address, "id">): CustomerAccount | undefined {
  return replaceAccount(accountId, (a) => {
    const addresses = a.addresses.map((x) => {
      if (x.id === addressId) return { ...input, id: addressId };
      return input.isDefault ? { ...x, isDefault: false } : x;
    });
    return { ...a, addresses, updatedAt: new Date().toISOString() };
  });
}

export function removeAddress(accountId: string, addressId: string): CustomerAccount | undefined {
  return replaceAccount(accountId, (a) => ({
    ...a,
    addresses: a.addresses.filter((x) => x.id !== addressId),
    updatedAt: new Date().toISOString(),
  }));
}

export function setDefaultAddress(accountId: string, addressId: string): CustomerAccount | undefined {
  return replaceAccount(accountId, (a) => ({
    ...a,
    addresses: a.addresses.map((x) => ({ ...x, isDefault: x.id === addressId })),
    updatedAt: new Date().toISOString(),
  }));
}

export function addPaymentPreference(accountId: string, input: Omit<PaymentPreference, "id">): CustomerAccount | undefined {
  return replaceAccount(accountId, (a) => {
    const id = uid("PAY");
    const isDefault = input.isDefault || a.paymentPreferences.length === 0;
    const prefs = isDefault ? a.paymentPreferences.map((x) => ({ ...x, isDefault: false })) : a.paymentPreferences;
    return { ...a, paymentPreferences: [...prefs, { ...input, id, isDefault }], updatedAt: new Date().toISOString() };
  });
}

export function removePaymentPreference(accountId: string, prefId: string): CustomerAccount | undefined {
  return replaceAccount(accountId, (a) => ({
    ...a,
    paymentPreferences: a.paymentPreferences.filter((x) => x.id !== prefId),
    updatedAt: new Date().toISOString(),
  }));
}

export function setDefaultPaymentPreference(accountId: string, prefId: string): CustomerAccount | undefined {
  return replaceAccount(accountId, (a) => ({
    ...a,
    paymentPreferences: a.paymentPreferences.map((x) => ({ ...x, isDefault: x.id === prefId })),
    updatedAt: new Date().toISOString(),
  }));
}

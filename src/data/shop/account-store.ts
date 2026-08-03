// Storefront — mock customer-account store: accounts, the current session,
// and single-use auth tokens (email verification / password reset). Same
// shape as data/bud-guardian/inventory-store.ts: module-level singletons,
// localStorage-backed, cross-tab sync via the `storage` event, pub/sub
// listeners. The session lives in localStorage (not sessionStorage) so it
// survives a browser restart, per the "Persistent sessions" requirement.
// Purely local and simulated — no backend, no network call. Never imports
// from or writes to data/bud-guardian/**, lib/staff/**, or
// components/staff/**.

import type { AccountSession, AuthToken, CustomerAccount } from "@/types/account";
import { SHOP_ACCOUNTS } from "./accounts";

const ACCOUNTS_KEY = "wb-shop-accounts-v1";
const SESSION_KEY = "wb-shop-session-v1";
const TOKENS_KEY = "wb-shop-auth-tokens-v1";

function loadJson<T>(key: string, fallback: () => T): T {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // Corrupt/unavailable storage — fall back to the seed below.
    }
  }
  return fallback();
}

let accounts: CustomerAccount[] = loadJson(ACCOUNTS_KEY, () => SHOP_ACCOUNTS.map((a) => ({ ...a })));
let session: AccountSession | null = loadJson(SESSION_KEY, () => null);
let tokens: AuthToken[] = loadJson(TOKENS_KEY, () => []);

const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // Storage full/unavailable (private browsing) — in-memory state still works.
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (![ACCOUNTS_KEY, SESSION_KEY, TOKENS_KEY].includes(event.key ?? "")) return;
    accounts = loadJson(ACCOUNTS_KEY, () => accounts);
    session = loadJson(SESSION_KEY, () => null);
    tokens = loadJson(TOKENS_KEY, () => tokens);
    notify();
  });
}

export function subscribeAccountStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccounts(): CustomerAccount[] {
  return accounts;
}

export function findAccountByEmail(email: string): CustomerAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return accounts.find((a) => a.email.toLowerCase() === normalized);
}

export function findAccountById(id: string): CustomerAccount | undefined {
  return accounts.find((a) => a.id === id);
}

export function addAccount(account: CustomerAccount): void {
  accounts = [...accounts, account];
  persist();
  notify();
}

export function replaceAccount(id: string, updater: (account: CustomerAccount) => CustomerAccount): CustomerAccount | undefined {
  let updated: CustomerAccount | undefined;
  accounts = accounts.map((a) => {
    if (a.id !== id) return a;
    updated = updater(a);
    return updated;
  });
  if (updated) {
    persist();
    notify();
  }
  return updated;
}

export function getSession(): AccountSession | null {
  return session;
}

export function setSession(next: AccountSession | null): void {
  session = next;
  persist();
  notify();
}

export function getTokens(): AuthToken[] {
  return tokens;
}

export function addToken(token: AuthToken): void {
  tokens = [...tokens, token];
  persist();
  notify();
}

export function findToken(tokenValue: string): AuthToken | undefined {
  return tokens.find((t) => t.token === tokenValue);
}

export function markTokenUsed(tokenValue: string): void {
  tokens = tokens.map((t) => (t.token === tokenValue ? { ...t, usedAt: new Date().toISOString() } : t));
  persist();
  notify();
}

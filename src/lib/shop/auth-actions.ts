"use client";

// Storefront — "use client" auth hooks: the React-facing layer over
// data/shop/account-store.ts + lib/shop/auth-engine.ts, matching the
// data/*-store.ts -> lib/*-engine.ts -> lib/*-actions.ts convention used by
// lib/staff/inventory-actions.ts. Never imports from or writes to
// data/bud-guardian/**, lib/staff/**, or components/staff/**.

import { useCallback } from "react";
import { useSyncExternalStore } from "react";
import { findAccountById, getSession, subscribeAccountStore } from "@/data/shop/account-store";
import { mergeGuestIntoAccount } from "./cart-engine";
import * as authEngine from "./auth-engine";
import type { AccountSession, CustomerAccount } from "@/types/account";

export function useSession(): AccountSession | null {
  return useSyncExternalStore(subscribeAccountStore, getSession, () => null);
}

export function useAccount(): CustomerAccount | null {
  const session = useSession();
  return session ? (findAccountById(session.accountId) ?? null) : null;
}

export function useAuthActions() {
  const signUp = useCallback((input: authEngine.SignUpInput) => {
    const result = authEngine.signUp(input);
    if (result.ok) mergeGuestIntoAccount(result.data.account.id);
    return result;
  }, []);

  const login = useCallback((email: string, password: string) => {
    const result = authEngine.login(email, password);
    if (result.ok) mergeGuestIntoAccount(result.data.account.id);
    return result;
  }, []);

  const logout = useCallback(() => authEngine.logout(), []);
  const requestPasswordReset = useCallback((email: string) => authEngine.requestPasswordReset(email), []);
  const resetPassword = useCallback((token: string, password: string) => authEngine.resetPassword(token, password), []);
  const confirmEmailVerification = useCallback((token: string) => authEngine.confirmEmailVerification(token), []);
  const requestEmailVerification = useCallback((accountId: string) => authEngine.requestEmailVerification(accountId), []);

  return { signUp, login, logout, requestPasswordReset, resetPassword, confirmEmailVerification, requestEmailVerification };
}

export function useProfileActions() {
  const updateProfile = useCallback(
    (accountId: string, input: { firstName: string; lastName: string; phone: string }) => authEngine.updateProfile(accountId, input),
    []
  );
  const updateMarketingOptIn = useCallback(
    (accountId: string, marketingOptIn: boolean) => authEngine.updateMarketingOptIn(accountId, marketingOptIn),
    []
  );
  const changePassword = useCallback(
    (accountId: string, currentPassword: string, newPassword: string) => authEngine.changePassword(accountId, currentPassword, newPassword),
    []
  );
  return { updateProfile, updateMarketingOptIn, changePassword };
}

export function useAddressActions() {
  const addAddress = useCallback((accountId: string, input: Parameters<typeof authEngine.addAddress>[1]) => authEngine.addAddress(accountId, input), []);
  const updateAddress = useCallback(
    (accountId: string, addressId: string, input: Parameters<typeof authEngine.updateAddress>[2]) =>
      authEngine.updateAddress(accountId, addressId, input),
    []
  );
  const removeAddress = useCallback((accountId: string, addressId: string) => authEngine.removeAddress(accountId, addressId), []);
  const setDefaultAddress = useCallback((accountId: string, addressId: string) => authEngine.setDefaultAddress(accountId, addressId), []);
  return { addAddress, updateAddress, removeAddress, setDefaultAddress };
}

export function usePaymentPreferenceActions() {
  const addPaymentPreference = useCallback(
    (accountId: string, input: Parameters<typeof authEngine.addPaymentPreference>[1]) => authEngine.addPaymentPreference(accountId, input),
    []
  );
  const removePaymentPreference = useCallback(
    (accountId: string, prefId: string) => authEngine.removePaymentPreference(accountId, prefId),
    []
  );
  const setDefaultPaymentPreference = useCallback(
    (accountId: string, prefId: string) => authEngine.setDefaultPaymentPreference(accountId, prefId),
    []
  );
  return { addPaymentPreference, removePaymentPreference, setDefaultPaymentPreference };
}

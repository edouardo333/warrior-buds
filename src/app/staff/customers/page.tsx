"use client";

import { useSyncExternalStore } from "react";
import StaffLogin from "@/components/staff/StaffLogin";
import CustomersDashboard from "@/components/staff/CustomersDashboard";
import { readSession, subscribeSessionChange } from "@/lib/staff/staff-auth";

function getServerSnapshot() {
  return null;
}

export default function StaffCustomersPage() {
  const session = useSyncExternalStore(subscribeSessionChange, readSession, getServerSnapshot);

  if (!session) return <StaffLogin />;
  return <CustomersDashboard session={session} />;
}

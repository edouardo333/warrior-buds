"use client";

import { useSyncExternalStore } from "react";
import StaffLogin from "@/components/staff/StaffLogin";
import SecurityDashboard from "@/components/staff/SecurityDashboard";
import { readSession, subscribeSessionChange } from "@/lib/staff/staff-auth";

function getServerSnapshot() {
  return null;
}

export default function StaffSecurityPage() {
  const session = useSyncExternalStore(subscribeSessionChange, readSession, getServerSnapshot);

  if (!session) return <StaffLogin />;
  return <SecurityDashboard session={session} />;
}

"use client";

import { useSyncExternalStore } from "react";
import StaffLogin from "@/components/staff/StaffLogin";
import StaffHub from "@/components/staff/StaffHub";
import { readSession, subscribeSessionChange } from "@/lib/staff/staff-auth";

function getServerSnapshot() {
  return null;
}

export default function StaffPage() {
  const session = useSyncExternalStore(subscribeSessionChange, readSession, getServerSnapshot);

  if (!session) return <StaffLogin />;
  return <StaffHub session={session} />;
}

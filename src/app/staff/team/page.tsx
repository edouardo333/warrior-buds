"use client";

import { useSyncExternalStore } from "react";
import StaffLogin from "@/components/staff/StaffLogin";
import StaffTeamDashboard from "@/components/staff/StaffTeamDashboard";
import { readSession, subscribeSessionChange } from "@/lib/staff/staff-auth";

function getServerSnapshot() {
  return null;
}

export default function StaffTeamPage() {
  const session = useSyncExternalStore(subscribeSessionChange, readSession, getServerSnapshot);

  if (!session) return <StaffLogin />;
  return <StaffTeamDashboard session={session} />;
}

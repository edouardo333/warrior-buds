"use client";

import { useSyncExternalStore } from "react";
import StaffLogin from "@/components/staff/StaffLogin";
import AnalyticsDashboard from "@/components/staff/AnalyticsDashboard";
import { readSession, subscribeSessionChange } from "@/lib/staff/staff-auth";

function getServerSnapshot() {
  return null;
}

export default function StaffAnalyticsPage() {
  const session = useSyncExternalStore(subscribeSessionChange, readSession, getServerSnapshot);

  if (!session) return <StaffLogin />;
  return <AnalyticsDashboard session={session} />;
}

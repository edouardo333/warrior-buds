"use client";

import { useParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import StaffLogin from "@/components/staff/StaffLogin";
import InventoryProductPage from "@/components/staff/InventoryProductPage";
import { readSession, subscribeSessionChange } from "@/lib/staff/staff-auth";

function getServerSnapshot() {
  return null;
}

export default function StaffInventoryProductRoute() {
  const session = useSyncExternalStore(subscribeSessionChange, readSession, getServerSnapshot);
  const params = useParams<{ id: string }>();

  if (!session) return <StaffLogin />;
  return <InventoryProductPage session={session} productId={params.id} />;
}

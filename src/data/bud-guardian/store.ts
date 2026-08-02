// Business facts Bud Guardian is allowed to state as fact. Re-exports the
// existing single sources of truth (site.ts, hours.ts) instead of
// duplicating them, so the assistant never drifts from the rest of the site.

import { SITE } from "@/lib/site";
import { getStoreStatus, getWeeklySchedule, STORE_TIMEZONE } from "@/lib/hours";

export const BUD_GUARDIAN_STORE = SITE;

export const BUD_GUARDIAN_LINKS = {
  directions: SITE.mapsUrl,
  instagram: SITE.instagramUrl,
  linktree: SITE.linktreeUrl,
  phone: SITE.phoneHref,
} as const;

export { getStoreStatus, getWeeklySchedule, STORE_TIMEZONE };

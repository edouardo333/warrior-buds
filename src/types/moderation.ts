// Bud Guardian V12.2 — Autonomous Abuse Defense types. A "moderation
// identity" is either a signed-in customer account (types/account.ts's
// CustomerAccount.id) or an anonymous browser device id (see
// lib/bud-guardian/guardian-identity.ts) — never a fingerprint, just an
// opaque locally-generated token, same pattern as every other id in this app
// (order ids, staff sessions, account ids).

export type ModerationIdentityType = "device" | "account";

// Warrior Buds Rule #1 = RESPECT. Each category maps 1:1 to one of the
// severe-abuse groups Bud Guardian must auto-ban for — deliberately narrow:
// normal complaints, criticism, disagreement, harmless profanity, quotes,
// and educational discussion are never in this list (see
// moderation-engine.ts's detectSevereViolation).
export type ModerationCategory =
  | "hate" // racism / extreme hate speech
  | "harassment" // severe or sexual harassment
  | "intimidation"
  | "violence-threat" // credible violence/death threats, incl. against staff/customers
  | "destruction-threat" // threats to burn/destroy Warrior Buds
  | "targeted-abuse"; // extreme, dehumanizing targeted verbal abuse

export type BanHistoryEntry = {
  id: string;
  at: string; // ISO — when this ban was issued
  banCount: number; // 1st, 2nd, 3rd... offense at the time of this entry
  category: ModerationCategory;
  months: number;
  expiresAt: string; // ISO
};

// One record per identity (device or account). banCount/category/bannedAt/
// expiresAt always reflect the MOST RECENT violation; `history` keeps every
// prior one for staff audit. Access is gated on isBanActive() (see
// moderation-engine.ts) comparing expiresAt to "now" at read time — a past
// expiry auto-restores access without deleting the record, so the
// escalation count survives for any future offense.
export type BanRecord = {
  key: string; // `${type}:${identityId}`
  type: ModerationIdentityType;
  identityId: string;
  banCount: number;
  category: ModerationCategory;
  matchedPhrase: string; // the specific flagged phrase — never the full message, to limit retained content
  bannedAt: string; // ISO, most recent
  expiresAt: string; // ISO, most recent
  history: BanHistoryEntry[];
};

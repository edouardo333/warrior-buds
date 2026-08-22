// Perf: split out of BudGuardian.tsx on purpose. ContactPageContent and
// FaqCta only need this event name string to dispatch a
// "open the widget" event — importing it straight from BudGuardian.tsx would
// pull that component's entire engine import graph (FAQ data, product/cart/
// checkout/support intent matchers, the AI provider, moderation/order/
// payment engines, ...) into the Contact and FAQ route bundles too, even
// though BudGuardian itself is already lazy-loaded separately via
// BudGuardianLoader.tsx. Keeping the constant here means those pages stay
// lightweight while the event contract (see BudGuardian.tsx's listener)
// still works exactly the same.
export const OPEN_BUD_GUARDIAN_EVENT = "wb:open-bud-guardian";

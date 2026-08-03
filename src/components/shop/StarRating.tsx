export default function StarRating({ rating, size = "sm" }: { rating: number | null; size?: "sm" | "md" }) {
  if (rating === null) return null;
  const dims = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex items-center gap-0.5 text-wb-yellow">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            fill={i < Math.round(rating) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            className={dims}
          >
            <path d="M12 2.5l2.9 6.06 6.6.79-4.9 4.5 1.3 6.55L12 16.9l-5.9 3.5 1.3-6.55-4.9-4.5 6.6-.79L12 2.5z" />
          </svg>
        ))}
      </span>
      <span className="text-xs text-foreground/60">{rating.toFixed(1)}</span>
    </span>
  );
}

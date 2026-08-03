export default function ProductImageFallback({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-wb-charcoal via-wb-charcoal-light to-black ${className}`}>
      <span className="px-4 text-center font-display uppercase tracking-widest text-white/10">{label}</span>
    </div>
  );
}

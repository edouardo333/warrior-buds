import { Leaf } from "lucide-react";

export default function ProductImageFallback({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-wb-charcoal via-wb-charcoal-light to-black">
      <div className="absolute inset-0 bg-noise opacity-[0.05]" />
      <div className="pointer-events-none absolute -top-8 -left-8 h-32 w-32 rounded-full bg-wb-orange/10 blur-[50px]" />
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-wb-red/10 blur-[50px]" />
      <div className="relative flex flex-col items-center gap-2 px-4">
        <Leaf className="h-6 w-6 text-white/10" strokeWidth={1.5} />
        <span className={`text-center font-display uppercase tracking-widest text-white/10 ${className}`}>{label}</span>
      </div>
    </div>
  );
}

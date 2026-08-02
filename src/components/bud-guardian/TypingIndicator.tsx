export default function TypingIndicator() {
  return (
    <div className="wb-guardian-message-in flex items-center gap-1 self-start rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-wb-orange"
          style={{
            animation: "wb-guardian-eye-idle 1.1s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

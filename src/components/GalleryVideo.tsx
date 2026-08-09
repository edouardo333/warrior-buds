"use client";

import { useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GalleryVideo() {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setIsMuted(false);
    void video.play();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  return (
    <section className="relative overflow-hidden bg-black px-5 pb-20 pt-32 sm:px-8 sm:py-20 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a0f08_0%,_#050403_55%,_#000000_100%)]" />
      <div className="absolute inset-0 bg-noise opacity-[0.04]" />
      <div className="pointer-events-none absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-wb-red/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-wb-orange/15 blur-[130px]" />

      <Reveal className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange">
          {t.gallery.hero.label}
        </p>
        <h1 className="mt-3 font-display text-5xl tracking-wide text-foreground sm:text-6xl">
          {t.gallery.hero.title}
        </h1>
        <p className="mt-5 max-w-md text-balance text-base text-foreground/60 sm:text-lg">
          {t.gallery.hero.subtitle}
        </p>
      </Reveal>

      <Reveal delay={150} className="relative z-10 mx-auto mt-12 flex justify-center sm:mt-16">
        <div className="relative mx-auto w-full max-w-md md:max-w-sm">
          <div
            className={`pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-wb-red/30 via-wb-orange/25 to-transparent blur-2xl transition-opacity duration-700 ${
              isPlaying ? "opacity-100" : "opacity-60"
            }`}
          />

          <div
            className={`group relative mx-auto overflow-hidden rounded-[1.75rem] border bg-wb-charcoal backdrop-blur-md transition-[box-shadow,border-color] duration-700 ${
              isPlaying
                ? "border-wb-orange/50 shadow-[0_0_80px_-10px_rgba(244,103,15,0.55)]"
                : "border-white/15 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.7)]"
            }`}
          >
            <video
              ref={videoRef}
              src="/images/videos/video-gallery.mp4"
              controls={isPlaying}
              loop
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onVolumeChange={() => setIsMuted(videoRef.current?.muted ?? false)}
              className="block h-auto max-h-[75vh] w-full"
            />

            {!isPlaying && (
              <button
                type="button"
                onClick={handlePlay}
                aria-label={t.gallery.video.playLabel}
                className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors duration-300 hover:bg-black/10"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow text-black shadow-[0_0_30px_-4px_rgba(244,103,15,0.75)] transition-transform duration-300 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:h-20 sm:w-20">
                  <Play className="ml-1 h-7 w-7 sm:h-8 sm:w-8" fill="currentColor" strokeWidth={0} />
                </span>
              </button>
            )}

            {isPlaying && (
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? t.gallery.video.unmuteLabel : t.gallery.video.muteLabel}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-foreground backdrop-blur-sm transition-colors duration-300 hover:border-wb-orange/60 hover:text-wb-orange"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

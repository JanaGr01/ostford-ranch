"use client";

import { useEffect, useState } from "react";

type StableDoorIntroProps = {
  horseName: string;
};

export default function StableDoorIntro({ horseName }: StableDoorIntroProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    const audio = new Audio("/sounds/horse-neigh.mp3");
    audio.volume = 0.45;

    audio.play().catch(() => {
      // Some browsers block autoplay if the page was opened directly.
      // The animation still works without sound.
    });

    const openTimer = setTimeout(() => {
      setIsOpening(true);
    }, 300);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(hideTimer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#2B2118]">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />

      <div className="relative z-10 text-center text-white">
        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.35em] text-white/70">
          Ostford Ranch
        </p>

        <h1 className="text-4xl font-bold md:text-6xl">
          Visiting {horseName}
        </h1>
      </div>

      <div
        className={`absolute left-0 top-0 h-full w-1/2 origin-left border-r-4 border-[#3A2418] bg-[#6B442D] shadow-2xl transition-transform duration-1000 ease-in-out ${
          isOpening ? "-translate-x-full rotate-y-12" : "translate-x-0"
        }`}
      >
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.08),transparent,rgba(0,0,0,0.2))]">
          <div className="absolute left-0 top-1/4 h-4 w-full bg-[#3A2418]" />
          <div className="absolute left-0 top-1/2 h-4 w-full bg-[#3A2418]" />
          <div className="absolute left-0 top-3/4 h-4 w-full bg-[#3A2418]" />

          <div className="absolute right-6 top-1/2 h-5 w-5 rounded-full bg-[#D6A85A] shadow-md" />
        </div>
      </div>

      <div
        className={`absolute right-0 top-0 h-full w-1/2 origin-right border-l-4 border-[#3A2418] bg-[#6B442D] shadow-2xl transition-transform duration-1000 ease-in-out ${
          isOpening ? "translate-x-full -rotate-y-12" : "translate-x-0"
        }`}
      >
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(0,0,0,0.2),transparent,rgba(255,255,255,0.08))]">
          <div className="absolute left-0 top-1/4 h-4 w-full bg-[#3A2418]" />
          <div className="absolute left-0 top-1/2 h-4 w-full bg-[#3A2418]" />
          <div className="absolute left-0 top-3/4 h-4 w-full bg-[#3A2418]" />

          <div className="absolute left-6 top-1/2 h-5 w-5 rounded-full bg-[#D6A85A] shadow-md" />
        </div>
      </div>
    </div>
  );
}
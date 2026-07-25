"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1920&q=80",
    alt: "Startup team collaboration",
  },
  {
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=80",
    alt: "Professional business meeting",
  },
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80",
    alt: "Financial analytics dashboard",
  },
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80",
    alt: "Fintech and digital innovation",
  },
  {
    src: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1920&q=80",
    alt: "Technology network background",
  },
  {
    src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80",
    alt: "Team collaborating on a startup project",
  },
  {
    src: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1920&q=80",
    alt: "Cryptocurrency trading dashboard",
  },
  {
    src: "https://images.unsplash.com/photo-1640161704729-cbe966a08476?auto=format&fit=crop&w=1920&q=80",
    alt: "Digital blockchain network visualization",
  },
  {
    src: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1920&q=80",
    alt: "Bitcoin and cryptocurrency concept",
  },
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80",
    alt: "Fintech innovation and digital payments",
  },
  {
    src: "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1920&q=80",
    alt: "Modern financial technology interface",
  },
  {
    src: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1920&q=80",
    alt: "Secure online transactions and cybersecurity",
  },
  {
    src: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1920&q=80",
    alt: "Digital fundraising and crowdfunding",
  },
  {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80",
    alt: "Data analytics and financial growth",
  },
  {
    src: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=80",
    alt: "Partners shaking hands on a deal",
  },
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80",
    alt: "Growth analytics on a laptop screen",
  },
] as const;

const SLIDE_INTERVAL_MS = 6000;
const FADE_DURATION_MS = 1000;

type HeroBackgroundSliderProps = {
  slideIndex: number;
};

export function HeroBackgroundSlider({
  slideIndex,
}: HeroBackgroundSliderProps) {
  return (
    <div className="absolute inset-0 z-0" aria-hidden>
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity ease-in-out",
            index === slideIndex ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
        >
          <Image
            src={slide.src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={cn(
              "object-cover object-center transition-transform ease-out",
              index === slideIndex && "animate-hero-ken-burns",
            )}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-background" />
    </div>
  );
}

export function useHeroSlider(slideCount: number = HERO_SLIDES.length) {
  const [slideIndex, setSlideIndex] = useState(0);

  const goToSlide = useCallback(
    (index: number) => {
      setSlideIndex(((index % slideCount) + slideCount) % slideCount);
    },
    [slideCount],
  );

  const nextSlide = useCallback(() => {
    setSlideIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    const timer = setInterval(nextSlide, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return { slideIndex, goToSlide, slideCount };
}

export function HeroSlideIndicators({
  slideIndex,
  slideCount,
  onSelect,
}: {
  slideIndex: number;
  slideCount: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div
      className="mt-10 flex items-center justify-center gap-2"
      role="tablist"
      aria-label="Hero background slides"
    >
      {Array.from({ length: slideCount }).map((_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={index === slideIndex}
          aria-label={`Show slide ${index + 1}`}
          onClick={() => onSelect(index)}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            index === slideIndex
              ? "w-8 bg-white"
              : "w-1.5 bg-white/40 hover:bg-white/70",
          )}
        />
      ))}
    </div>
  );
}

export { HERO_SLIDES };

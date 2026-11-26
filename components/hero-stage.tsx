"use client";

import dynamic from "next/dynamic";

const HeroMemoryCard = dynamic(
  () =>
    import("@/components/hero-memory-card").then((mod) => mod.HeroMemoryCard),
  { ssr: false },
);

export function HeroStage() {
  return (
    <div className="hero-stage absolute inset-0">
      <HeroMemoryCard />
    </div>
  );
}

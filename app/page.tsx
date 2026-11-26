import { BrushField } from "@/components/brush-field";
import { HeroStage } from "@/components/hero-stage";

export default function Home() {
  return (
    <main className="relative h-dvh overflow-hidden bg-carbon-black pt-[var(--nav-height)]">
      <BrushField />
      <HeroStage />
    </main>
  );
}

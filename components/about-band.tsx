"use client";

import { useEffect, useState } from "react";

const photos = [
  { src: "/carrousel-pics/1.jpg", alt: "Baterista de la banda en el escenario" },
  { src: "/carrousel-pics/2.jpg", alt: "Guitarrista con capucha y lentes oscuros" },
  { src: "/carrousel-pics/3.jpg", alt: "Bajista con gorro frente al micrófono" },
  { src: "/carrousel-pics/4.jpg", alt: "Cantante con micrófono vintage" },
] as const;

const SLIDE_MS = 4500;

export function AboutBand() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % photos.length);
    }, SLIDE_MS);

    return () => window.clearInterval(id);
  }, []);

  const photo = photos[index];

  return (
    <main className="flex min-h-dvh items-center justify-center px-[20px] pt-[var(--nav-height)] pb-[96px]">
      <div className="flex w-full max-w-[860px] flex-col items-center gap-10 md:flex-row md:items-center md:justify-center md:gap-16">
        <button
          type="button"
          aria-label={`${photo.alt}. Foto ${index + 1} de ${photos.length}. Siguiente foto`}
          onClick={() => setIndex((current) => (current + 1) % photos.length)}
          className="relative aspect-square w-[min(340px,100%)] shrink-0 overflow-hidden bg-black"
        >
          <span
            className="flex h-full transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{
              width: `${photos.length * 100}%`,
              transform: `translateX(-${(index * 100) / photos.length}%)`,
            }}
          >
            {photos.map((item) => (
              <img
                key={item.src}
                src={item.src}
                alt=""
                className="h-full object-cover"
                style={{ width: `${100 / photos.length}%` }}
              />
            ))}
          </span>
        </button>
        <div className="w-full min-w-0 max-w-[420px] text-left text-pure-white">
          <h1 className="text-[32px] leading-[1.15] font-extrabold tracking-[-0.03em]">
            El Culto del Oculto
          </h1>
          <p className="mt-5 text-[20px] leading-[1.45] font-normal">
            Banda Mexicana originaria de Hidalgo. Música alternativa con
            influencias electrónicas de Synthpop, Postpunk, EBM, Witch House y
            Dark Wave 🖤
          </p>
        </div>
      </div>
    </main>
  );
}

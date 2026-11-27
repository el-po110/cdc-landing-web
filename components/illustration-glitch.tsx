"use client";

import { useEffect, useRef } from "react";

const TINTS = ["#ff0d26", "#00f2ff", "#0dff47", "#3852ff", "#ffd60d"];

function fract(value: number) {
  return value - Math.floor(value);
}

function tintFor(id: number, seed: number) {
  const p = fract(id * 0.41 + seed * 0.17);
  if (p >= 0.88) return TINTS[4];
  if (p >= 0.7) return TINTS[3];
  if (p >= 0.45) return TINTS[2];
  if (p >= 0.2) return TINTS[1];
  return TINTS[0];
}

function containedRect(
  imgW: number,
  imgH: number,
  boxW: number,
  boxH: number,
  side: "left" | "right",
) {
  const scale = Math.min(boxW / imgW, boxH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const x = side === "right" ? boxW - dw : 0;
  const y = (boxH - dh) / 2;
  return { x, y, dw, dh };
}

export function IllustrationGlitch({
  src,
  side,
  playing,
}: {
  src: string;
  side: "left" | "right";
  playing: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const reset = () => {
      img.style.transform = "";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const fit = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(box.width * dpr));
      const height = Math.max(1, Math.round(box.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { width: box.width, height: box.height };
    };

    const paintBurst = () => {
      if (!img.naturalWidth) return;
      const { width, height } = fit();
      const rect = containedRect(img.naturalWidth, img.naturalHeight, width, height, side);
      const kick = (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 50);
      const color = 0.07 + Math.random() * 0.08;
      const seed = Math.random() * 20;
      img.style.transform = `translateX(${kick}px)`;

      ctx.clearRect(0, 0, width, height);
      const bands = 10;
      const bandH = rect.dh / bands;
      for (let i = 0; i < bands; i += 1) {
        const id = Math.floor(i + seed);
        if (fract(id * 0.67 + seed) < 0.34) continue;
        const dir = id % 2 === 0 ? 1 : -1;
        const mag = 0.45 + fract(id * 1.37 + seed) * 0.55;
        const slice = color * dir * mag * rect.dw;
        const top = rect.y + i * bandH;

        ctx.save();
        ctx.beginPath();
        ctx.rect(rect.x + kick, top, rect.dw, bandH);
        ctx.clip();
        ctx.drawImage(img, rect.x + kick + slice, rect.y, rect.dw, rect.dh);
        ctx.globalCompositeOperation = "source-atop";
        ctx.globalAlpha = 0.88;
        ctx.fillStyle = tintFor(id, seed);
        ctx.fillRect(rect.x + kick, top, rect.dw, bandH);
        ctx.restore();
      }
    };

    const burst = {
      active: false,
      until: 0,
      next: 0,
    };

    const frame = (now: number) => {
      if (!running || !playingRef.current || reduce) return;
      raf = window.requestAnimationFrame(frame);

      if (!burst.active && now >= burst.next) {
        burst.active = true;
        burst.until = now + 80 + Math.random() * 100;
      }
      if (!burst.active) return;
      if (now >= burst.until) {
        burst.active = false;
        burst.next = now + 1100 + Math.random() * 1700;
        reset();
        return;
      }
      paintBurst();
    };

    const start = (now: number) => {
      burst.active = false;
      burst.until = 0;
      burst.next = now + 1100 + Math.random() * 1700;
      raf = window.requestAnimationFrame(frame);
    };

    if (playing && !reduce) {
      raf = window.requestAnimationFrame(start);
    } else {
      reset();
    }

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      reset();
    };
  }, [playing, side, src]);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <img
        ref={imgRef}
        src={src}
        alt=""
        className={`absolute inset-0 h-full w-full object-contain ${
          side === "right" ? "object-right" : "object-left"
        }`}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

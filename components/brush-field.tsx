"use client";

import { useEffect, useRef } from "react";

const PALETTE: Array<[number, number, number]> = [
  [225, 6, 0],
  [110, 16, 22],
  [45, 45, 45],
  [180, 180, 180],
  [221, 221, 221],
  [255, 255, 255],
  [225, 6, 0],
];

const CYCLE = 18;

type Stroke = {
  x: number;
  y: number;
  angle: number;
  len: number;
  width: number;
  speed: number;
  age: number;
  maxLife: number;
  wobble: number;
  shade: number;
  phase: number;
  broad: boolean;
};

function mixPalette(time: number): [number, number, number] {
  const stops = PALETTE.length - 1;
  const safe = Number.isFinite(time) ? time : 0;
  const wrapped = ((safe % CYCLE) + CYCLE) % CYCLE;
  const scaled = (wrapped / CYCLE) * stops;
  const i = Math.min(stops - 1, Math.max(0, Math.floor(scaled)));
  const f = scaled - i;
  const a = PALETTE[i];
  const b = PALETTE[i + 1];
  return [
    a[0] + (b[0] - a[0]) * f,
    a[1] + (b[1] - a[1]) * f,
    a[2] + (b[2] - a[2]) * f,
  ];
}

function wrapAngle(delta: number) {
  let turn = delta;
  while (turn > Math.PI) turn -= Math.PI * 2;
  while (turn < -Math.PI) turn += Math.PI * 2;
  return turn;
}

function tint(rgb: [number, number, number], shade: number) {
  const mix = Math.min(0.92, Math.max(0, shade));
  return [
    rgb[0] + (17 - rgb[0]) * mix,
    rgb[1] + (17 - rgb[1]) * mix,
    rgb[2] + (17 - rgb[2]) * mix,
  ];
}

export function BrushField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const strokes: Stroke[] = [];
    let raf = 0;
    let running = true;
    let last = performance.now();
    let wind = 0.68;
    let elapsed = 0;
    const pointer = { x: 0, y: 0, vx: 0, vy: 0 };

    const edgeAlpha = (x: number, y: number) => {
      const dx = (x / width - 0.5) * 2;
      const dy = (y / height - 0.5) * 2;
      const d = Math.hypot(dx * 1.25, dy * 0.78);
      if (d < 0.28) return 0.05;
      return Math.min(1, (d - 0.28) / 0.72);
    };

    const edgePoint = () => {
      const side = Math.floor(Math.random() * 4);
      if (side === 0) return { x: Math.random() * width, y: Math.random() * height * 0.46 };
      if (side === 1) return { x: Math.random() * width, y: height * (0.54 + Math.random() * 0.46) };
      if (side === 2) return { x: Math.random() * width * 0.42, y: Math.random() * height };
      return { x: width * (0.58 + Math.random() * 0.42), y: Math.random() * height };
    };

    const pushStroke = (x: number, y: number, angle: number, broad: boolean) => {
      strokes.push({
        x,
        y,
        angle,
        len: 120 + Math.random() * 280,
        width: broad ? 4.4 + Math.random() * 4.8 : 0.9 + Math.random() * 2.3,
        speed: 36 + Math.random() * 70,
        age: 0,
        maxLife: 3.4 + Math.random() * 4,
        wobble: (Math.random() - 0.5) * (broad ? 20 : 46),
        shade: broad ? 0.48 + Math.random() * 0.28 : 0.18 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        broad,
      });
    };

    const spawnBundle = (scattered: boolean) => {
      const spot = edgePoint();
      let angle = wind + (Math.random() - 0.5) * 0.7;
      if (Math.random() < 0.42) angle += Math.PI * (0.55 + Math.random() * 0.5);
      const count = 14 + Math.floor(Math.random() * 10);
      const px = -Math.sin(angle);
      const py = Math.cos(angle);
      const spread = 22 + Math.random() * 54;
      for (let i = 0; i < count; i++) {
        const along = (i / Math.max(1, count - 1) - 0.5) * spread;
        const jitter = (Math.random() - 0.5) * 8;
        let x = spot.x + px * along + jitter;
        let y = spot.y + py * along + jitter;
        const hairAngle = angle + (Math.random() - 0.5) * 0.22;
        if (!scattered) {
          x -= Math.cos(hairAngle) * (140 + Math.random() * 80);
          y -= Math.sin(hairAngle) * (140 + Math.random() * 80);
        }
        pushStroke(x, y, hairAngle, i < 2);
      }
    };

    const targetCount = () => Math.round((width * height) / 300);

    const fillPopulation = () => {
      strokes.length = 0;
      const goal = targetCount();
      let guard = 0;
      while (strokes.length < goal && guard < 40) {
        spawnBundle(true);
        guard += 1;
      }
      for (const stroke of strokes) stroke.age = Math.random() * stroke.maxLife;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fillPopulation();
    };

    const drawStroke = (stroke: Stroke, rgb: [number, number, number]) => {
      const t = stroke.age / stroke.maxLife;
      const fade = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI);
      if (fade < 0.04) return;
      const [r, g, b] = tint(rgb, stroke.shade);
      const nx = Math.cos(stroke.angle);
      const ny = Math.sin(stroke.angle);
      const px = -ny;
      const py = nx;
      const hairs = stroke.broad ? 2 : 4;
      ctx.strokeStyle = `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
      ctx.lineCap = "round";

      for (let hair = 0; hair < hairs; hair++) {
        const spread = (hair - (hairs - 1) / 2) * (stroke.broad ? 1.5 : stroke.width * 0.8);
        const c1x = nx * stroke.len * 0.5 + px * stroke.wobble;
        const c1y = ny * stroke.len * 0.5 + py * stroke.wobble;
        const c2x = nx * stroke.len;
        const c2y = ny * stroke.len;
        const steps = 4;
        for (let step = 0; step < steps; step++) {
          const u0 = step / steps;
          const u1 = (step + 1) / steps;
          const at = (u: number) => {
            const k = 1 - u;
            return {
              x: stroke.x + px * spread + 2 * k * u * c1x + u * u * c2x,
              y: stroke.y + py * spread + 2 * k * u * c1y + u * u * c2y,
            };
          };
          const p0 = at(u0);
          const p1 = at(u1);
          const mask = edgeAlpha((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
          const alpha = fade * mask * (stroke.broad ? 0.16 : 0.38);
          if (alpha < 0.03) continue;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = stroke.width * (1 - u0 * 0.55);
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
      }
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000 || 0));
      last = now;
      if (!reduced) {
        elapsed += dt;
        const ambient =
          0.58 + Math.sin(elapsed * 0.09) * 0.42 + Math.sin(elapsed * 0.037) * 0.16;
        const reach = Math.min(1, Math.hypot(pointer.x, pointer.y));
        const cursorAngle = Math.atan2(pointer.y, pointer.x);
        wind = ambient + wrapAngle(cursorAngle - ambient) * reach * 0.8;
        pointer.vx *= Math.exp(-dt * 2.6);
        pointer.vy *= Math.exp(-dt * 2.6);
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, width, height);
      const rgb = reduced ? PALETTE[0] : mixPalette(elapsed);

      if (!reduced) {
        for (let i = strokes.length - 1; i >= 0; i--) {
          const stroke = strokes[i];
          stroke.age += dt;
          stroke.x += Math.cos(stroke.angle) * stroke.speed * dt + pointer.vx * 760 * dt;
          stroke.y += Math.sin(stroke.angle) * stroke.speed * dt + pointer.vy * 760 * dt;
          stroke.angle += Math.sin(elapsed * 0.55 + stroke.phase) * 0.08 * dt;
          const reach = Math.min(1, Math.hypot(pointer.x, pointer.y));
          stroke.angle += wrapAngle(Math.atan2(pointer.y, pointer.x) - stroke.angle) * reach * 0.7 * dt;
          const off =
            stroke.x < -stroke.len - 120 ||
            stroke.y < -stroke.len - 120 ||
            stroke.x > width + stroke.len + 120 ||
            stroke.y > height + stroke.len + 120;
          if (stroke.age >= stroke.maxLife || off) strokes.splice(i, 1);
        }

        let guard = 0;
        while (strokes.length < targetCount() && guard < 3) {
          spawnBundle(false);
          guard += 1;
        }
      }

      ctx.save();
      ctx.translate(pointer.x * 36, pointer.y * 24);
      for (const stroke of strokes) drawStroke(stroke, rgb);
      ctx.restore();
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    resize();
    last = performance.now();
    raf = requestAnimationFrame(frame);

    const onResize = () => resize();
    const onHide = () => {
      if (document.hidden) {
        running = false;
        return;
      }
      if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const onPointer = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      pointer.vx += nx - pointer.x;
      pointer.vy += ny - pointer.y;
      pointer.x = nx;
      pointer.y = ny;
    };
    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      pointer.x = 0;
      pointer.y = 0;
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pointermove", onPointer);
    document.documentElement.addEventListener("pointerout", onPointerOut);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerout", onPointerOut);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

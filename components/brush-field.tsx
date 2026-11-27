"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

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

function WindCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    const strokes: Stroke[] = [];
    let raf = 0;
    let running = true;
    let last = performance.now();
    let wind = 0.68;
    let elapsed = 0;
    const pointer = { x: 0, y: 0, vx: 0, vy: 0 };

    const ellipseOf = (x: number, y: number) => {
      const rx = Math.max(1, width * 0.46);
      const ry = Math.max(1, height * 0.38);
      const ex = (x - width * 0.5) / rx;
      const ey = (y - height * 0.5) / ry;
      return { ex, ey, rx, ry };
    };

    const orbitAngle = (x: number, y: number) => {
      const { ex, ey, rx, ry } = ellipseOf(x, y);
      if (ex * ex + ey * ey < 0.004) return wind;
      return Math.atan2(ry * ex, -rx * ey);
    };

    const edgeAlpha = (x: number, y: number) => {
      const { ex, ey } = ellipseOf(x, y);
      const mask = Math.min(1, Math.max(0, (Math.hypot(ex, ey) - 0.42) / 0.58));
      return 0.04 + mask * 0.96;
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
      const angle = orbitAngle(spot.x, spot.y) + (Math.random() - 0.5) * 0.4;
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

    const targetCount = () => Math.min(2400, Math.round((width * height) / 180));

    const fillPopulation = () => {
      strokes.length = 0;
      const goal = targetCount();
      let guard = 0;
      while (strokes.length < goal && guard < 200) {
        spawnBundle(true);
        guard += 1;
      }
      for (const stroke of strokes) stroke.age = Math.random() * stroke.maxLife;
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width));
      canvas.height = Math.max(1, Math.floor(height));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
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
      const mask = edgeAlpha(stroke.x + nx * stroke.len * 0.5, stroke.y + ny * stroke.len * 0.5);
      const alpha = fade * mask * (stroke.broad ? 0.16 : 0.38);
      if (alpha < 0.03) return;
      ctx.strokeStyle = `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
      ctx.lineCap = "round";
      ctx.globalAlpha = alpha;
      ctx.lineWidth = stroke.width;
      const c1x = nx * stroke.len * 0.5 + px * stroke.wobble;
      const c1y = ny * stroke.len * 0.5 + py * stroke.wobble;
      const endX = nx * stroke.len;
      const endY = ny * stroke.len;

      for (let hair = 0; hair < 2; hair++) {
        const spread = (hair - 0.5) * (stroke.broad ? 1.5 : stroke.width * 0.8);
        const ox = px * spread;
        const oy = py * spread;
        ctx.beginPath();
        ctx.moveTo(stroke.x + ox, stroke.y + oy);
        ctx.quadraticCurveTo(
          stroke.x + ox + c1x,
          stroke.y + oy + c1y,
          stroke.x + ox + endX,
          stroke.y + oy + endY,
        );
        ctx.stroke();
      }
    };

    const FRAME_MS = 1000 / 30;

    const frame = (now: number) => {
      if (!running) return;
      const since = now - last;
      if (!reduced && since < FRAME_MS) {
        raf = requestAnimationFrame(frame);
        return;
      }
      last = now;
      const dt = Math.min(0.05, Math.max(0, since / 1000 || 0));
      const reach = Math.min(1, Math.hypot(pointer.x, pointer.y));
      const cursorAngle = Math.atan2(pointer.y, pointer.x);
      if (!reduced) {
        elapsed += dt;
        const ambient =
          0.58 + Math.sin(elapsed * 0.09) * 0.42 + Math.sin(elapsed * 0.037) * 0.16;
        wind = ambient + wrapAngle(cursorAngle - ambient) * reach * 0.8;
        pointer.vx *= Math.exp(-dt * 2.6);
        pointer.vy *= Math.exp(-dt * 2.6);
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, width, height);
      const rgb = reduced ? PALETTE[0] : mixPalette(elapsed);

      if (!reduced) {
        const shoveX = pointer.vx * 760 * dt;
        const shoveY = pointer.vy * 760 * dt;
        const rx = Math.max(1, width * 0.46);
        const ry = Math.max(1, height * 0.38);
        const cx = width * 0.5;
        const cy = height * 0.5;
        for (let i = strokes.length - 1; i >= 0; i--) {
          const stroke = strokes[i];
          stroke.age += dt;
          const nx = Math.cos(stroke.angle);
          const ny = Math.sin(stroke.angle);
          stroke.x += nx * stroke.speed * dt + shoveX;
          stroke.y += ny * stroke.speed * dt + shoveY;
          const ex = (stroke.x - cx) / rx;
          const ey = (stroke.y - cy) / ry;
          const rad = Math.hypot(ex, ey);
          if (rad < 0.48 && rad > 0.0001) {
            const dx = stroke.x - cx;
            const dy = stroke.y - cy;
            const len = Math.hypot(dx, dy) || 1;
            const push = (0.48 - rad) * 70 * dt;
            stroke.x += (dx / len) * push;
            stroke.y += (dy / len) * push;
          }
          const orbit = rad < 0.06 ? wind : Math.atan2(ry * ex, -rx * ey);
          stroke.angle += wrapAngle(orbit - stroke.angle) * Math.min(1, 4 * dt);
          stroke.angle += Math.sin(elapsed * 0.55 + stroke.phase) * 0.08 * dt;
          stroke.angle += wrapAngle(cursorAngle - stroke.angle) * reach * 0.55 * dt;
          const off =
            stroke.x < -stroke.len - 120 ||
            stroke.y < -stroke.len - 120 ||
            stroke.x > width + stroke.len + 120 ||
            stroke.y > height + stroke.len + 120;
          if (stroke.age >= stroke.maxLife || off) {
            const lastStroke = strokes.pop();
            if (lastStroke && i < strokes.length) strokes[i] = lastStroke;
          }
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
      className="pointer-events-none fixed inset-0 z-0 h-dvh w-full"
    />
  );
}

export function BrushField() {
  const pathname = usePathname();
  if (pathname === "/reproductor") return null;
  return <WindCanvas />;
}

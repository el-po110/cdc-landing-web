"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Rgb = [number, number, number];

const PALETTE: Rgb[] = [
  [225, 6, 0],
  [110, 16, 22],
  [45, 45, 45],
  [180, 180, 180],
  [221, 221, 221],
  [255, 255, 255],
  [225, 6, 0],
];

const PAGE_PALETTES: Record<string, Rgb[]> = {
  "/fechas": [
    [9, 6, 112],
    [122, 2, 2],
    [148, 146, 146],
    [9, 6, 112],
  ],
  "/contacto": [
    [212, 49, 0],
    [245, 243, 242],
    [184, 2, 2],
    [212, 49, 0],
  ],
  "/acerca-de": [
    [107, 1, 70],
    [115, 114, 114],
    [143, 0, 0],
    [107, 1, 70],
  ],
};

const CYCLE = 18;
const PLAYER_STEP = CYCLE / 3;
const PLAYER_PALETTE: Rgb[] = [
  ...PALETTE.slice(0, -1),
  ...PAGE_PALETTES["/fechas"].slice(0, -1),
  ...PAGE_PALETTES["/contacto"].slice(0, -1),
  ...PAGE_PALETTES["/acerca-de"].slice(0, -1),
  PALETTE[0],
];
const PLAYER_CYCLE = (PLAYER_PALETTE.length - 1) * PLAYER_STEP;
const MAX_STROKES = 2400;
const INSTANCE_FLOATS = 11;
const BODY_SEGMENTS = 8;
const CAP_SLICES = 6;

const RIBBON_VERT = `#version 300 es
precision highp float;

layout(location = 0) in float aT;
layout(location = 1) in float aAcross;
layout(location = 2) in float aRadial;
layout(location = 3) in float aHair;
layout(location = 4) in float aKind;
layout(location = 5) in vec2 aOrigin;
layout(location = 6) in vec4 aGeom;
layout(location = 7) in vec4 aColor;
layout(location = 8) in float aBroad;

uniform vec2 uResolution;
uniform vec2 uOffset;

out float vAcross;
out float vRadial;
out float vKind;
out vec3 vColor;
out float vAlpha;

void main() {
  float angle = aGeom.x;
  float len = aGeom.y;
  float width = aGeom.z;
  float wobble = aGeom.w;
  vec2 tangent = vec2(cos(angle), sin(angle));
  vec2 normal = vec2(-tangent.y, tangent.x);
  float spread = (aHair - 0.5) * (aBroad > 0.5 ? 1.5 : width * 0.8);
  vec2 origin = aOrigin + normal * spread + uOffset;
  vec2 p0 = origin;
  vec2 p2 = origin + tangent * len;
  vec2 p1 = origin + tangent * len * 0.5 + normal * wobble;

  float u = aT;
  float iu = 1.0 - u;
  vec2 vel = 2.0 * iu * (p1 - p0) + 2.0 * u * (p2 - p1);
  float vlen = length(vel);
  vec2 tdir = vlen > 0.0001 ? vel / vlen : tangent;
  vec2 nrm = vec2(-tdir.y, tdir.x);
  vec2 pos;

  if (aKind < 0.5) {
    vec2 bez = iu * iu * p0 + 2.0 * iu * u * p1 + u * u * p2;
    pos = bez + nrm * aAcross * width * 0.5;
  } else if (aKind < 1.5) {
    float theta = aAcross * 1.57079632679;
    pos = p0 + (-tdir * cos(theta) + nrm * sin(theta)) * width * 0.5;
  } else {
    float theta = aAcross * 1.57079632679;
    pos = p2 + (tdir * cos(theta) + nrm * sin(theta)) * width * 0.5;
  }

  gl_Position = vec4(
    (pos.x / uResolution.x) * 2.0 - 1.0,
    1.0 - (pos.y / uResolution.y) * 2.0,
    0.0,
    1.0
  );
  vAcross = aAcross;
  vRadial = aRadial;
  vKind = aKind;
  vColor = aColor.rgb;
  vAlpha = aColor.a;
}
`;

const RIBBON_FRAG = `#version 300 es
precision highp float;

in float vAcross;
in float vRadial;
in float vKind;
in vec3 vColor;
in float vAlpha;
out vec4 fragColor;

void main() {
  float edge = vKind < 0.5 ? abs(vAcross) : vRadial;
  float aa = fwidth(edge);
  float cover = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, edge);
  if (cover <= 0.001) discard;
  fragColor = vec4(vColor, vAlpha * cover);
}
`;

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
  reverse: boolean;
};

type BrushGl = {
  draw: (
    data: Float32Array,
    count: number,
    offsetX: number,
    offsetY: number,
    cssWidth: number,
    cssHeight: number,
  ) => void;
  dispose: () => void;
};

function mixPalette(time: number, palette: Rgb[], cycle = CYCLE): Rgb {
  const stops = palette.length - 1;
  const span = cycle > 0 ? cycle : CYCLE;
  const safe = Number.isFinite(time) ? time : 0;
  const wrapped = ((safe % span) + span) % span;
  const scaled = (wrapped / span) * stops;
  const i = Math.min(stops - 1, Math.max(0, Math.floor(scaled)));
  const f = scaled - i;
  const a = palette[i];
  const b = palette[i + 1];
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

const FLOW_HOLD = 7;
const FLOW_BLEND = 4;
const FLOW_SLOT = FLOW_HOLD + FLOW_BLEND;
const FLOW_COUNT = 5;
const SQUARE_TILT = (14 * Math.PI) / 180;

function smoothstep01(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function lerpAngle(from: number, to: number, t: number) {
  return from + wrapAngle(to - from) * t;
}

function flowMix(time: number) {
  const span = FLOW_SLOT * FLOW_COUNT;
  const wrapped = ((time % span) + span) % span;
  const slot = Math.floor(wrapped / FLOW_SLOT) % FLOW_COUNT;
  const local = wrapped - slot * FLOW_SLOT;
  const t = local <= FLOW_HOLD ? 0 : smoothstep01((local - FLOW_HOLD) / FLOW_BLEND);
  return { from: slot, to: (slot + 1) % FLOW_COUNT, t };
}

function ellipseNorm(x: number, y: number, width: number, height: number) {
  const rx = Math.max(1, width * 0.46);
  const ry = Math.max(1, height * 0.38);
  const ex = (x - width * 0.5) / rx;
  const ey = (y - height * 0.5) / ry;
  return { ex, ey, rx, ry };
}

function squareNorm(x: number, y: number, width: number, height: number) {
  const half = Math.max(1, Math.min(width, height) * 0.36);
  const dx = x - width * 0.5;
  const dy = y - height * 0.5;
  const c = Math.cos(SQUARE_TILT);
  const s = Math.sin(SQUARE_TILT);
  return {
    lx: (dx * c + dy * s) / half,
    ly: (-dx * s + dy * c) / half,
    c,
    s,
  };
}

function flowHeading(mode: number, x: number, y: number, width: number, height: number) {
  if (mode === 1) return Math.PI / 4;
  if (mode === 2) return (3 * Math.PI) / 4;
  if (mode === 3) return Math.PI / 2;
  if (mode === 4) {
    const { lx, ly, c, s } = squareNorm(x, y, width, height);
    const side = Math.min(1, Math.max(0, (Math.abs(lx) - Math.abs(ly)) * 1.8 + 0.5));
    const vertical = lx >= 0 ? -Math.PI / 2 : Math.PI / 2;
    const horizontal = ly >= 0 ? 0 : Math.PI;
    const local = lerpAngle(horizontal, vertical, side);
    const vx = Math.cos(local);
    const vy = Math.sin(local);
    return Math.atan2(vx * s + vy * c, vx * c - vy * s);
  }
  const { ex, ey, rx, ry } = ellipseNorm(x, y, width, height);
  if (ex * ex + ey * ey < 0.004) return 0.68;
  return Math.atan2(ry * ex, -rx * ey);
}

function aimedHeading(
  mode: number,
  x: number,
  y: number,
  width: number,
  height: number,
  reverse: boolean,
) {
  const angle = flowHeading(mode, x, y, width, height);
  return reverse ? angle + Math.PI : angle;
}

function flowCover(mode: number, x: number, y: number, width: number, height: number) {
  if (mode === 0) {
    const { ex, ey } = ellipseNorm(x, y, width, height);
    const mask = Math.min(1, Math.max(0, (Math.hypot(ex, ey) - 0.42) / 0.58));
    return 0.04 + mask * 0.96;
  }
  if (mode === 4) {
    const { lx, ly } = squareNorm(x, y, width, height);
    const rad = Math.max(Math.abs(lx), Math.abs(ly));
    const mask = Math.min(1, Math.max(0, (rad - 0.7) / 0.45));
    return 0.04 + mask * 0.96;
  }
  return 1;
}

function flowPush(mode: number, x: number, y: number, width: number, height: number) {
  if (mode === 0) {
    const { ex, ey } = ellipseNorm(x, y, width, height);
    const rad = Math.hypot(ex, ey);
    if (rad < 0.48 && rad > 0.0001) return (0.48 - rad) * 70;
    return 0;
  }
  if (mode === 4) {
    const { lx, ly } = squareNorm(x, y, width, height);
    const rad = Math.max(Math.abs(lx), Math.abs(ly));
    if (rad < 0.82 && rad > 0.0001) return (0.82 - rad) * 90;
    return 0;
  }
  return 0;
}

function ribbonMesh() {
  const verts: number[] = [];
  const push = (
    t: number,
    across: number,
    radial: number,
    hair: number,
    kind: number,
  ) => {
    verts.push(t, across, radial, hair, kind);
  };

  for (let hair = 0; hair < 2; hair++) {
    for (let i = 0; i < BODY_SEGMENTS; i++) {
      const t0 = i / BODY_SEGMENTS;
      const t1 = (i + 1) / BODY_SEGMENTS;
      push(t0, -1, 1, hair, 0);
      push(t0, 1, 1, hair, 0);
      push(t1, -1, 1, hair, 0);
      push(t0, 1, 1, hair, 0);
      push(t1, 1, 1, hair, 0);
      push(t1, -1, 1, hair, 0);
    }
    for (let end = 0; end < 2; end++) {
      const t = end === 0 ? 0 : 1;
      const kind = end === 0 ? 1 : 2;
      for (let i = 0; i < CAP_SLICES; i++) {
        const a0 = -1 + (2 * i) / CAP_SLICES;
        const a1 = -1 + (2 * (i + 1)) / CAP_SLICES;
        push(t, 0, 0, hair, kind);
        push(t, a0, 1, hair, kind);
        push(t, a1, 1, hair, kind);
      }
    }
  }

  return new Float32Array(verts);
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createBrushGl(gl: WebGL2RenderingContext): BrushGl | null {
  const vert = compileShader(gl, gl.VERTEX_SHADER, RIBBON_VERT);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, RIBBON_FRAG);
  if (!vert || !frag) return null;

  const program = gl.createProgram();
  const meshBuffer = gl.createBuffer();
  const instanceBuffer = gl.createBuffer();
  const vao = gl.createVertexArray();
  if (!program || !meshBuffer || !instanceBuffer || !vao) return null;

  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  const mesh = ribbonMesh();
  const vertexCount = mesh.length / 5;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
  const meshStride = 5 * 4;
  for (let loc = 0; loc < 5; loc++) {
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, meshStride, loc * 4);
    gl.vertexAttribDivisor(loc, 0);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, MAX_STROKES * INSTANCE_FLOATS * 4, gl.DYNAMIC_DRAW);
  const stride = INSTANCE_FLOATS * 4;
  const attribs: Array<[number, number, number]> = [
    [5, 2, 0],
    [6, 4, 2 * 4],
    [7, 4, 6 * 4],
    [8, 1, 10 * 4],
  ];
  for (const [loc, size, offset] of attribs) {
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
    gl.vertexAttribDivisor(loc, 1);
  }
  gl.bindVertexArray(null);

  const uResolution = gl.getUniformLocation(program, "uResolution");
  const uOffset = gl.getUniformLocation(program, "uOffset");
  gl.clearColor(17 / 255, 17 / 255, 17 / 255, 1);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  return {
    draw(data, count, offsetX, offsetY, cssWidth, cssHeight) {
      if (gl.isContextLost() || cssWidth < 1 || cssHeight < 1) return;
      const visible = Math.max(0, Math.min(count, MAX_STROKES));
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
      if (visible > 0) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, visible * INSTANCE_FLOATS));
      }
      gl.uniform2f(uResolution, cssWidth, cssHeight);
      gl.uniform2f(uOffset, offsetX, offsetY);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (visible > 0) gl.drawArraysInstanced(gl.TRIANGLES, 0, vertexCount, visible);
    },
    dispose() {
      gl.deleteBuffer(meshBuffer);
      gl.deleteBuffer(instanceBuffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    },
  };
}

function WindCanvas({
  flows = false,
  palette = PALETTE,
  cycle = CYCLE,
}: {
  flows?: boolean;
  palette?: Rgb[];
  cycle?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef(palette);
  const cycleRef = useRef(cycle);
  paletteRef.current = palette;
  cycleRef.current = cycle;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    const brush = gl ? createBrushGl(gl) : null;
    if (!brush) {
      canvas.style.background = "#111111";
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    const strokes: Stroke[] = [];
    const instanceData = new Float32Array(MAX_STROKES * INSTANCE_FLOATS);
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

    let flowAim = (x: number, y: number, reverse: boolean) =>
      aimedHeading(0, x, y, width, height, reverse);
    let flowCoverAt = (x: number, y: number) => edgeAlpha(x, y);
    let flowPushAt = (x: number, y: number) => flowPush(0, x, y, width, height);

    const syncFlow = () => {
      if (!flows) return;
      const mix = flowMix(elapsed);
      const stay = 1 - mix.t;
      flowAim = (x, y, reverse) =>
        lerpAngle(
          aimedHeading(mix.from, x, y, width, height, reverse),
          aimedHeading(mix.to, x, y, width, height, reverse),
          mix.t,
        );
      flowCoverAt = (x, y) =>
        flowCover(mix.from, x, y, width, height) * stay +
        flowCover(mix.to, x, y, width, height) * mix.t;
      flowPushAt = (x, y) =>
        flowPush(mix.from, x, y, width, height) * stay +
        flowPush(mix.to, x, y, width, height) * mix.t;
    };

    const edgePoint = () => {
      const side = Math.floor(Math.random() * 4);
      if (side === 0) return { x: Math.random() * width, y: Math.random() * height * 0.46 };
      if (side === 1) return { x: Math.random() * width, y: height * (0.54 + Math.random() * 0.46) };
      if (side === 2) return { x: Math.random() * width * 0.42, y: Math.random() * height };
      return { x: width * (0.58 + Math.random() * 0.42), y: Math.random() * height };
    };

    const pushStroke = (x: number, y: number, angle: number, broad: boolean, reverse: boolean) => {
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
        reverse,
      });
    };

    const spawnBundle = (scattered: boolean) => {
      const spot = edgePoint();
      const base = flows ? flowAim(spot.x, spot.y, false) : orbitAngle(spot.x, spot.y);
      const angle = base + (Math.random() - 0.5) * 0.4;
      const count = 14 + Math.floor(Math.random() * 10);
      const px = -Math.sin(angle);
      const py = Math.cos(angle);
      const spread = 22 + Math.random() * 54;
      for (let i = 0; i < count; i++) {
        const along = (i / Math.max(1, count - 1) - 0.5) * spread;
        const jitter = (Math.random() - 0.5) * 8;
        let x = spot.x + px * along + jitter;
        let y = spot.y + py * along + jitter;
        const strokeReverse = flows && Math.random() < 0.25;
        const hairBase = flows ? flowAim(x, y, strokeReverse) : angle;
        const hairAngle = hairBase + (Math.random() - 0.5) * 0.22;
        if (!scattered) {
          x -= Math.cos(hairAngle) * (140 + Math.random() * 80);
          y -= Math.sin(hairAngle) * (140 + Math.random() * 80);
        }
        pushStroke(x, y, hairAngle, i < 2, strokeReverse);
      }
    };

    const targetCount = () => Math.min(MAX_STROKES, Math.round((width * height) / 180));

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

    const paint = () => {
      if (width < 1 || height < 1) return;
      const colors = paletteRef.current;
      const rgb = reduced ? colors[0] : mixPalette(elapsed, colors, cycleRef.current);
      let count = 0;
      for (const stroke of strokes) {
        const life = stroke.age / stroke.maxLife;
        const fade = Math.sin(Math.min(1, Math.max(0, life)) * Math.PI);
        if (fade < 0.04) continue;
        const [r, g, b] = tint(rgb, stroke.shade);
        const nx = Math.cos(stroke.angle);
        const ny = Math.sin(stroke.angle);
        const midX = stroke.x + nx * stroke.len * 0.5;
        const midY = stroke.y + ny * stroke.len * 0.5;
        const mask = flows ? flowCoverAt(midX, midY) : edgeAlpha(midX, midY);
        const alpha = fade * mask * (stroke.broad ? 0.16 : 0.38);
        if (alpha < 0.03) continue;
        if (count >= MAX_STROKES) break;
        const o = count * INSTANCE_FLOATS;
        instanceData[o] = stroke.x;
        instanceData[o + 1] = stroke.y;
        instanceData[o + 2] = stroke.angle;
        instanceData[o + 3] = stroke.len;
        instanceData[o + 4] = stroke.width;
        instanceData[o + 5] = stroke.wobble;
        instanceData[o + 6] = (r | 0) / 255;
        instanceData[o + 7] = (g | 0) / 255;
        instanceData[o + 8] = (b | 0) / 255;
        instanceData[o + 9] = alpha;
        instanceData[o + 10] = stroke.broad ? 1 : 0;
        count += 1;
      }
      brush.draw(instanceData, count, pointer.x * 36, pointer.y * 24, width, height);
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const bufW = Math.max(1, Math.floor(width * dpr));
      const bufH = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== bufW || canvas.height !== bufH) {
        canvas.width = bufW;
        canvas.height = bufH;
      }
      syncFlow();
      fillPopulation();
      paint();
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
        if (!flows) {
          const ambient =
            0.58 + Math.sin(elapsed * 0.09) * 0.42 + Math.sin(elapsed * 0.037) * 0.16;
          wind = ambient + wrapAngle(cursorAngle - ambient) * reach * 0.8;
          pointer.vx *= Math.exp(-dt * 2.6);
          pointer.vy *= Math.exp(-dt * 2.6);
        }
      }

      if (!reduced) {
        const shoveX = flows ? 0 : pointer.vx * 760 * dt;
        const shoveY = flows ? 0 : pointer.vy * 760 * dt;
        if (flows) syncFlow();
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
          if (flows) {
            const push = flowPushAt(stroke.x, stroke.y) * dt;
            if (push > 0) {
              const dx = stroke.x - cx;
              const dy = stroke.y - cy;
              const len = Math.hypot(dx, dy) || 1;
              stroke.x += (dx / len) * push;
              stroke.y += (dy / len) * push;
            }
            const orbit = flowAim(stroke.x, stroke.y, stroke.reverse);
            stroke.angle += wrapAngle(orbit - stroke.angle) * Math.min(1, 4 * dt);
            stroke.angle += Math.sin(elapsed * 0.55 + stroke.phase) * 0.08 * dt;
          } else {
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
          }
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

      paint();
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
    const onLost = (event: Event) => {
      event.preventDefault();
      running = false;
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
    canvas.addEventListener("webglcontextlost", onLost);
    if (!flows) {
      window.addEventListener("pointermove", onPointer);
      document.documentElement.addEventListener("pointerout", onPointerOut);
    }
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      brush.dispose();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onHide);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (!flows) {
        window.removeEventListener("pointermove", onPointer);
        document.documentElement.removeEventListener("pointerout", onPointerOut);
      }
    };
  }, [flows]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={
        flows
          ? "pointer-events-none absolute inset-0 h-full w-full bg-carbon-black"
          : "pointer-events-none fixed inset-0 z-0 h-dvh w-full bg-carbon-black"
      }
    />
  );
}

export function BrushField() {
  const pathname = usePathname();
  if (pathname === "/reproductor") return null;
  return <WindCanvas palette={PAGE_PALETTES[pathname] ?? PALETTE} />;
}

export function PlayerBrushField() {
  return <WindCanvas flows palette={PLAYER_PALETTE} cycle={PLAYER_CYCLE} />;
}

"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import { ShaderMaterial, SRGBColorSpace, type Group, type Texture } from "three";

const tilt = (40 * Math.PI) / 180;
const planeW = 2.55;
const cardW = 1.46;
const cardH = 1.88;

const glitchVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glitchFragment = `
  uniform sampler2D map;
  uniform float uOffset;
  uniform float uSeed;
  uniform float uLive;
  varying vec2 vUv;

  void main() {
    if (uLive < 0.5) discard;

    float cardU = (vUv.x - 0.5) * (${planeW.toFixed(2)} / ${cardW.toFixed(2)}) + 0.5;
    float cardV = vUv.y;
    float id = floor(cardV * 10.0 + uSeed);
    float show = step(0.34, fract(id * 0.67 + uSeed));
    float dir = mod(id, 2.0) < 1.0 ? 1.0 : -1.0;
    float mag = 0.45 + fract(id * 1.37 + uSeed) * 0.55;
    float shift = uOffset * dir * mag;
    float su = cardU - shift;
    float sv = cardV;
    float inside = step(0.0, su) * step(su, 1.0) * step(0.0, sv) * step(sv, 1.0);
    if (show * inside < 0.5) discard;

    vec2 photoUv = (vec2(su, sv) - 0.5) * vec2(${cardW.toFixed(2)} / 1.32, ${cardH.toFixed(2)} / 1.70) + 0.5;
    float inPhoto = step(0.0, photoUv.x) * step(photoUv.x, 1.0) * step(0.0, photoUv.y) * step(photoUv.y, 1.0);
    float mask = inPhoto > 0.5 ? texture2D(map, photoUv).r : 0.78;

    float p = fract(id * 0.41 + uSeed * 0.17);
    vec3 tint = vec3(1.0, 0.05, 0.15);
    tint = mix(tint, vec3(0.0, 0.95, 1.0), step(0.2, p));
    tint = mix(tint, vec3(0.05, 1.0, 0.28), step(0.45, p));
    tint = mix(tint, vec3(0.22, 0.32, 1.0), step(0.7, p));
    tint = mix(tint, vec3(1.0, 0.84, 0.05), step(0.88, p));

    gl_FragColor = vec4(tint * (0.5 + mask), 0.94);
  }
`;

function createGlitchMaterial(map: Texture) {
  const material = new ShaderMaterial({
    uniforms: {
      map: { value: map },
      uOffset: { value: 0 },
      uSeed: { value: 0 },
      uLive: { value: 0 },
    },
    vertexShader: glitchVertex,
    fragmentShader: glitchFragment,
    transparent: true,
    depthWrite: false,
  });
  material.toneMapped = false;
  return material;
}

function MemoryCard({
  mode,
  playing,
  onActivate,
}: {
  mode: "hero" | "transport";
  playing: boolean;
  onActivate?: () => void;
}) {
  const hero = mode === "hero";
  const spin = useRef<Group>(null);
  const shift = useRef<Group>(null);
  const follow = useRef<Group>(null);
  const reduceMotion = useRef(false);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 });
  const glitch = useRef({
    active: false,
    until: 0,
    next: 0.8,
    offset: 0,
    color: 0,
    seed: 0,
  });
  const [front, back] = useTexture([
    "/memory-card-face.png",
    "/memory-card-back.png",
  ]);
  const frontGlitch = useMemo(
    () => (hero ? createGlitchMaterial(front) : null),
    [front, hero],
  );
  const backGlitch = useMemo(
    () => (hero ? createGlitchMaterial(back) : null),
    [back, hero],
  );

  useEffect(() => {
    reduceMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!hero) return;
    const onMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = -((event.clientY / window.innerHeight) * 2 - 1);
      const aim = pointer.current;
      aim.vx += nx - aim.tx;
      aim.vy += ny - aim.ty;
      aim.tx = nx;
      aim.ty = ny;
    };
    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      pointer.current.tx = 0;
      pointer.current.ty = 0;
    };
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerout", onOut);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerout", onOut);
    };
  }, [hero]);

  for (const texture of [front, back]) {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
  }

  useFrame((state, delta) => {
    const spinNow = hero || (playing && !reduceMotion.current);
    if (spin.current && spinNow) {
      spin.current.rotation.y += delta * 0.35;
    }
    if (!hero || reduceMotion.current) return;
    if (follow.current) {
      const aim = pointer.current;
      const ease = Math.min(1, delta * 4);
      aim.x += (aim.tx - aim.x) * ease;
      aim.y += (aim.ty - aim.y) * ease;
      aim.vx *= Math.exp(-delta * 3);
      aim.vy *= Math.exp(-delta * 3);
      follow.current.position.x = aim.x * 0.46 + aim.vx * 0.4;
      follow.current.position.y = aim.y * 0.3 + aim.vy * 0.24;
      follow.current.rotation.y = aim.x * 0.34 + aim.vx * 0.45;
      follow.current.rotation.x = -aim.y * 0.2 - aim.vy * 0.28;
    }
    if (!shift.current || !frontGlitch || !backGlitch) return;

    const now = state.clock.elapsedTime;
    const burst = glitch.current;

    if (!burst.active && now >= burst.next) {
      burst.active = true;
      burst.until = now + 0.08 + Math.random() * 0.1;
    }

    if (burst.active) {
      const kick = 0.32 + Math.random() * 0.5;
      burst.offset = Math.random() > 0.5 ? kick : -kick;
      burst.color = 0.07 + Math.random() * 0.08;
      burst.seed = Math.random() * 20;
      if (now >= burst.until) {
        burst.active = false;
        burst.offset = 0;
        burst.color = 0;
        burst.next = now + 1.1 + Math.random() * 1.7;
      }
    }

    shift.current.position.x = burst.offset;
    const live = burst.active ? 1 : 0;
    for (const material of [frontGlitch, backGlitch]) {
      material.uniforms.uLive.value = live;
      material.uniforms.uOffset.value = burst.color;
      material.uniforms.uSeed.value = burst.seed;
    }
  });

  return (
    <group
      ref={shift}
      position={[0, -0.05, -0.7]}
      onClick={(event) => {
        event.stopPropagation();
        onActivate?.();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <group ref={follow}>
      <group rotation={[0.22, 0, tilt]} scale={hero ? 0.84 : 1.35}>
      <group ref={spin} rotation={[0, 0.5, 0]}>
        <RoundedBox args={[1.46, 1.88, 0.16]} radius={0.08} smoothness={5}>
          <meshPhysicalMaterial
            color="#6e1016"
            roughness={0.38}
            metalness={0.06}
            clearcoat={0.55}
            clearcoatRoughness={0.32}
          />
        </RoundedBox>
        <mesh position={[0, 0, 0.09]} renderOrder={1}>
          <planeGeometry args={[1.32, 1.7]} />
          <meshStandardMaterial
            map={front}
            roughness={0.72}
            metalness={0}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
        <mesh position={[0, 0, -0.09]} rotation={[0, Math.PI, 0]} renderOrder={1}>
          <planeGeometry args={[1.32, 1.7]} />
          <meshStandardMaterial
            map={back}
            roughness={0.64}
            metalness={0}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
        {frontGlitch && backGlitch ? (
          <>
            <mesh position={[0, 0, 0.11]} renderOrder={3} raycast={() => null}>
              <planeGeometry args={[planeW, cardH]} />
              <primitive object={frontGlitch} attach="material" />
            </mesh>
            <mesh
              position={[0, 0, -0.11]}
              rotation={[0, Math.PI, 0]}
              renderOrder={3}
              raycast={() => null}
            >
              <planeGeometry args={[planeW, cardH]} />
              <primitive object={backGlitch} attach="material" />
            </mesh>
          </>
        ) : null}
      </group>
      </group>
      </group>
    </group>
  );
}

export function HeroMemoryCard({
  mode = "hero",
  playing = false,
  onActivate,
}: {
  mode?: "hero" | "transport";
  playing?: boolean;
  onActivate?: () => void;
}) {
  const router = useRouter();
  const activate =
    onActivate ?? (mode === "hero" ? () => router.push("/reproductor") : undefined);

  return (
    <div
      className={`h-full w-full${mode === "transport" ? " cursor-pointer" : ""}`}
      role={mode === "hero" ? "link" : "button"}
      tabIndex={0}
      aria-label={
        mode === "hero" ? "Abrir el reproductor" : playing ? "Pausar" : "Reproducir"
      }
      onClick={mode === "transport" ? () => activate?.() : undefined}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        activate?.();
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 30 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
        style={{ pointerEvents: mode === "transport" ? "none" : "auto" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2.4, 3.2, 4]} intensity={2.6} />
        <directionalLight position={[-3.2, -1.2, 2]} intensity={0.45} />
        <Suspense fallback={null}>
          <MemoryCard mode={mode} playing={playing} onActivate={activate} />
        </Suspense>
      </Canvas>
    </div>
  );
}

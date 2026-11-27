"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import catalog from "@/data/tracks.json";
import { IllustrationGlitch } from "@/components/illustration-glitch";

const TransportCard = dynamic(
  () => import("@/components/hero-memory-card").then((mod) => mod.HeroMemoryCard),
  { ssr: false },
);

type LyricLine = { time: number; text: string };

type Track = {
  id: string;
  title: string;
  audio: string;
  illustration: string;
  illustrationSide: "left" | "right";
  lyrics: string;
};

const tracks = catalog.tracks as Track[];

function parseLyrics(source: string) {
  const stamp = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  const lines: LyricLine[] = [];
  for (const raw of source.split(/\r?\n/)) {
    stamp.lastIndex = 0;
    const times: number[] = [];
    for (const match of raw.matchAll(stamp)) {
      const fraction = match[3] ? Number(match[3]) / 10 ** match[3].length : 0;
      times.push(Number(match[1]) * 60 + Number(match[2]) + fraction);
    }
    stamp.lastIndex = 0;
    const text = raw.replace(stamp, "").trim();
    if (!text || times.length === 0) continue;
    for (const time of times) lines.push({ time, text });
  }
  lines.sort((a, b) => a.time - b.time);
  return lines;
}

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function GlitchLyric({
  text,
  align,
  reduceMotion,
}: {
  text: string;
  align: "left" | "right";
  reduceMotion: boolean;
}) {
  const lineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const node = lineRef.current;
    if (!node) return;
    if (reduceMotion || !text) {
      node.style.transform = "";
      return;
    }
    let frame = 0;
    let start = 0;
    const until = 80 + Math.random() * 100;
    const tick = (now: number) => {
      if (!start) start = now;
      if (now - start >= until) {
        node.style.transform = "";
        return;
      }
      const kick = (Math.random() > 0.5 ? 1 : -1) * (36 + Math.random() * 36);
      node.style.transform = `translateX(${kick}px)`;
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      node.style.transform = "";
    };
  }, [text, reduceMotion]);

  if (!text) return null;

  return (
    <p
      ref={lineRef}
      className={`lyric-urbana max-w-full text-[52px] leading-[1.2] text-pure-white ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {text}
    </p>
  );
}

function useReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", onStoreChange);
      return () => media.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function activeLyric(lines: LyricLine[], time: number) {
  let index = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= time) index = i;
    else break;
  }
  return index;
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [lyricsOn, setLyricsOn] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const seekingRef = useRef(false);
  const [titleShown, setTitleShown] = useState(tracks[0].title);
  const [titlePulse, setTitlePulse] = useState(0);
  const [lyricLines, setLyricLines] = useState<LyricLine[]>([]);
  const playingRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const track = tracks[0];
  const lyricIndex = activeLyric(lyricLines, currentTime);
  const lyricsSide = track.illustrationSide === "right" ? "left" : "right";

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    const audio = new Audio(track.audio);
    audio.preload = "auto";
    audio.volume = volume;
    audioRef.current = audio;

    const onTime = () => {
      if (!seekingRef.current) setCurrentTime(audio.currentTime);
    };
    const onDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnded = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
    // Volume is applied in its own effect so changing it does not reload the track.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.audio]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    let cancelled = false;
    fetch(track.lyrics)
      .then((response) => response.text())
      .then((source) => {
        if (!cancelled) setLyricLines(parseLyrics(source));
      })
      .catch(() => {
        if (!cancelled) setLyricLines([]);
      });
    return () => {
      cancelled = true;
    };
  }, [track.lyrics]);

  function armTitle() {
    setTitlePulse((pulse) => pulse + 1);
  }

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      armTitle();
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
      armTitle();
    } catch {
      setPlaying(false);
    }
  }

  function restart() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    armTitle();
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }

  useEffect(() => {
    if (titlePulse === 0 || reduceMotion) return;
    const title = track.title;

    let cancelled = false;
    let release = () => {};

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(resolve, ms);
        release = () => {
          window.clearTimeout(id);
          resolve();
        };
      });

    const type = async () => {
      for (let i = 0; i <= title.length; i += 1) {
        if (cancelled) return;
        setTitleShown(title.slice(0, i));
        await sleep(30);
      }
    };

    const erase = async () => {
      for (let i = title.length; i >= 0; i -= 1) {
        if (cancelled) return;
        setTitleShown(title.slice(0, i));
        await sleep(30);
      }
    };

    void (async () => {
      await type();
      while (!cancelled && playingRef.current) {
        await sleep(10000 + Math.random() * 1600);
        if (cancelled || !playingRef.current) break;
        await erase();
        if (cancelled || !playingRef.current) break;
        await sleep(400);
        if (cancelled || !playingRef.current) break;
        await type();
      }
      if (!cancelled) setTitleShown(title);
    })();

    return () => {
      cancelled = true;
      release();
    };
  }, [titlePulse, track.title, reduceMotion]);

  const activeLyricText = lyricIndex < 0 ? "" : lyricLines[lyricIndex].text;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <main className="relative h-dvh overflow-hidden bg-carbon-black text-pure-white">
      <IllustrationGlitch
        src={track.illustration}
        side={track.illustrationSide}
        playing={playing}
      />

      {lyricsOn ? (
        <div
          className={`pointer-events-none absolute inset-y-0 flex w-1/2 items-center px-[8vw] ${
            lyricsSide === "left" ? "left-0 justify-start" : "right-0 justify-end"
          }`}
        >
          <GlitchLyric
            text={activeLyricText}
            align={lyricsSide}
            reduceMotion={reduceMotion}
          />
        </div>
      ) : null}

      <Link
        href="/"
        aria-label="Volver al inicio"
        className="absolute top-[22px] left-[22px] z-10 text-[#940000] transition-opacity hover:opacity-70"
      >
        <DoorIcon />
      </Link>

      <h1
        aria-label={track.title}
        className="absolute top-[26px] left-1/2 z-10 -translate-x-1/2 text-[36px] leading-none font-normal tracking-[0.14em]"
      >
        <span aria-hidden="true">{reduceMotion ? track.title : titleShown}</span>
      </h1>

      <div className="absolute bottom-[28px] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-[18px]">
        <div className="flex w-[min(520px,70vw)] items-center gap-3 text-[13px] leading-none font-bold text-pure-white tabular-nums">
          <span className="w-11 text-right">{formatClock(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={duration > 0 ? Math.min(currentTime, duration) : 0}
            aria-label="Avance de la canción"
            onPointerDown={() => {
              seekingRef.current = true;
            }}
            onPointerUp={() => {
              seekingRef.current = false;
            }}
            onPointerCancel={() => {
              seekingRef.current = false;
            }}
            onChange={(event) => seek(Number(event.target.value))}
            className="seek-bar min-w-0 flex-1 cursor-pointer"
            style={{
              background: `linear-gradient(to right, #940000 ${progress}%, #2d2d2d ${progress}%)`,
            }}
          />
          <span className="w-11">{formatClock(duration)}</span>
        </div>
        <div className="flex items-center gap-[36px]">
        <div className="relative">
          {volumeOpen ? (
            <label className="absolute top-1/2 right-[calc(100%+14px)] flex h-8 w-28 -translate-y-1/2 items-center">
              <span className="sr-only">Nivel de volumen</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="w-full accent-[#940000]"
              />
            </label>
          ) : null}
          <ControlButton
            label="Volumen"
            pressed={volumeOpen}
            onClick={() => setVolumeOpen((open) => !open)}
          >
            <SpeakerIcon muted={volume === 0} />
          </ControlButton>
        </div>

        <ControlButton label="Anterior" onClick={restart}>
          <TriangleIcon direction="left" />
        </ControlButton>

        <div className="size-[156px]">
          <TransportCard mode="transport" playing={playing} onActivate={toggle} />
        </div>

        <ControlButton label="Siguiente" onClick={restart}>
          <TriangleIcon direction="right" />
        </ControlButton>

        <ControlButton
          label={lyricsOn ? "Ocultar letras" : "Mostrar letras"}
          pressed={lyricsOn}
          onClick={() => setLyricsOn((on) => !on)}
        >
          <LyricsIcon active={lyricsOn} />
        </ControlButton>
        </div>
      </div>
    </main>
  );
}

function ControlButton({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="grid size-[76px] place-items-center text-[#940000] transition-opacity hover:opacity-70"
    >
      {children}
    </button>
  );
}

function DoorIcon() {
  return (
    <svg width="34" height="46" viewBox="0 0 34 46" aria-hidden="true">
      <path
        d="M6 44V16a11 11 0 0 1 22 0v28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="22" cy="28" r="1.7" fill="currentColor" />
    </svg>
  );
}

function TriangleIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="42" height="42" viewBox="0 0 28 28" aria-hidden="true">
      <path
        d={direction === "left" ? "M20 4 L6 14 L20 24 Z" : "M8 4 L22 14 L8 24 Z"}
        fill="currentColor"
      />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="44" height="44" viewBox="0 0 30 30" aria-hidden="true">
      <path d="M4 11h5l6-5v18l-6-5H4z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      {muted ? (
        <path d="M20 11l7 8M27 11l-7 8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      ) : (
        <path
          d="M20 10a7 7 0 0 1 0 10M23.5 7a11 11 0 0 1 0 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      )}
    </svg>
  );
}

function LyricsIcon({ active }: { active: boolean }) {
  return (
    <svg width="46" height="46" viewBox="0 0 32 32" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="24"
        height="24"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeDasharray={active ? undefined : "3 3"}
      />
      <path
        d="M10 12h12M10 16h12M10 20h8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

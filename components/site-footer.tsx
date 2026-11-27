"use client";

import { usePathname } from "next/navigation";

const music = [
  { name: "Spotify", href: "https://open.spotify.com/intl-es/artist/7cHkTPe5n5YQPT2cGIwQ66?si=5c1b6498354841d8" },
  { name: "Bandcamp", href: "https://cultodeloculto.bandcamp.com/" },
  { name: "YouTube", href: "https://www.youtube.com/@elcultodeloculto" },
  { name: "SoundCloud", href: "https://soundcloud.com/cvlto_ocvlto" },
] as const;

const social = [
  { name: "TikTok", href: "https://tiktok.com/@cvlto.ocvlto" },
  { name: "Instagram", href: "https://www.instagram.com/cvlto_ocvlto/" },
  { name: "Facebook", href: "https://www.facebook.com/cvlto.ocvlto" },
] as const;

function SpotifyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M4.6 6.5c2.1-.9 4.6-.7 6.5.5M4.9 8.3c1.7-.7 3.6-.5 5.2.4M5.3 10.1c1.3-.5 2.7-.4 3.8.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BandcampIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2.4 11.6 L6.4 4.4 H13.6 L9.6 11.6 Z" fill="currentColor" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" aria-hidden="true">
      <rect
        x="1.6"
        y="3.6"
        width="12.8"
        height="8.8"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M6.8 6.2 L10.6 8 L6.8 9.8 Z" fill="currentColor" />
    </svg>
  );
}

function SoundCloudIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4.6 11.4h7a2.3 2.3 0 0 0 .2-4.6 3.1 3.1 0 0 0-5.9-.8 2.2 2.2 0 0 0-1.3 5.4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M9 2.4v7.1a2.5 2.5 0 1 1-1.7-2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M9.1 2.4c.4 1.7 1.7 2.7 3.4 2.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" aria-hidden="true">
      <rect
        x="2.3"
        y="2.3"
        width="11.4"
        height="11.4"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11.2" cy="4.8" r="0.7" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M9.3 13.4V8.7h1.5l.2-1.7H9.3V6c0-.5.2-.8.8-.8h.8V3.6c-.2 0-.7-.1-1.4-.1-1.4 0-2.4.9-2.4 2.5v1H5.6v1.7h1.5v4.7h2.2z"
        fill="currentColor"
      />
    </svg>
  );
}

const icons = {
  Spotify: SpotifyIcon,
  Bandcamp: BandcampIcon,
  YouTube: YouTubeIcon,
  SoundCloud: SoundCloudIcon,
  TikTok: TikTokIcon,
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
} as const;

function SocialLink({ name, href }: { name: keyof typeof icons; href: string }) {
  const Icon = icons[name];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      className="text-pure-white transition-opacity hover:opacity-70"
    >
      <Icon />
    </a>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/reproductor") return null;

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-[16px] z-10 flex justify-center px-[16px]">
      <nav
        aria-label="Redes"
        className="pointer-events-auto flex items-center rounded-full bg-black px-[22px] py-[11px] shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
      >
        <span className="flex items-center gap-[16px]">
          {music.map((item) => (
            <SocialLink key={item.name} name={item.name} href={item.href} />
          ))}
        </span>
        <span
          aria-hidden
          className="px-[16px] text-[14px] leading-none font-extrabold text-pure-white"
        >
          |
        </span>
        <span className="flex items-center gap-[16px]">
          {social.map((item) => (
            <SocialLink key={item.name} name={item.name} href={item.href} />
          ))}
        </span>
      </nav>
    </footer>
  );
}

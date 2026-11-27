"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/fechas", label: "FECHAS" },
  { href: "/contacto", label: "CONTACTO" },
  { href: "/acerca-de", label: "ACERCA DE" },
] as const;

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M2 6.5 L7 2.2 L12 6.5 V12 H9 V8.2 H5 V12 H2 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NavHeader() {
  const pathname = usePathname();

  if (pathname === "/reproductor") return null;

  const home = pathname === "/";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-[16px] z-10 flex justify-center px-[16px]">
      <nav
        aria-label="Secciones"
        className="pointer-events-auto flex items-center rounded-full bg-black px-[22px] py-[11px] shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
      >
        <Link
          href="/"
          aria-label="Inicio"
          aria-current={home ? "page" : undefined}
          className={`flex items-center transition-colors hover:text-signal-red ${home ? "text-signal-red" : "text-pure-white"}`}
        >
          <HomeIcon />
        </Link>
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <span key={link.href} className="flex items-center">
              <span
                aria-hidden
                className="px-[16px] text-[14px] leading-none font-extrabold text-pure-white"
              >
                |
              </span>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-[14px] leading-none font-extrabold tracking-normal transition-colors hover:text-signal-red ${
                  active ? "text-signal-red" : "text-pure-white"
                }`}
              >
                {link.label}
              </Link>
            </span>
          );
        })}
      </nav>
    </header>
  );
}

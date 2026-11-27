"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/fechas", label: "FECHAS" },
  { href: "/contacto", label: "CONTACTO" },
  { href: "/acerca-de", label: "ACERCA DE" },
] as const;

export function NavHeader() {
  const pathname = usePathname();

  if (pathname === "/reproductor") return null;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-[16px] z-10 flex justify-center px-[16px]">
      <nav
        aria-label="Secciones"
        className="pointer-events-auto flex items-center rounded-full bg-black px-[22px] py-[11px] shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
      >
        {links.map((link, index) => {
          const active = pathname === link.href;

          return (
            <span key={link.href} className="flex items-center">
              {index > 0 ? (
                <span
                  aria-hidden
                  className="px-[16px] text-[14px] leading-none font-extrabold text-pure-white"
                >
                  |
                </span>
              ) : null}
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-[14px] leading-none font-extrabold tracking-normal ${
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

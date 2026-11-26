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

  return (
    <header className="fixed inset-x-0 top-0 z-10 bg-carbon-black px-[20px] py-[10px]">
      <nav aria-label="Secciones" className="flex items-center justify-center">
        {links.map((link, index) => {
          const active = pathname === link.href;

          return (
            <span key={link.href} className="flex items-center">
              {index > 0 ? (
                <span
                  aria-hidden
                  className="px-[20px] text-[12px] leading-[1.25] font-extrabold text-silver-mist"
                >
                  |
                </span>
              ) : null}
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-[12px] leading-[1.25] font-extrabold tracking-normal ${
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

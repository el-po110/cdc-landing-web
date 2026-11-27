import type { Metadata } from "next";
import { BrushField } from "@/components/brush-field";
import { NavHeader } from "@/components/nav-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "El Culto del Oculto",
    template: "%s — El Culto del Oculto",
  },
  description: "Pachuca MX. Synthwave, Darkwave, Post-Punk.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-carbon-black font-sans text-pure-white">
        <BrushField />
        <div className="relative z-10">
          <NavHeader />
          {children}
        </div>
      </body>
    </html>
  );
}

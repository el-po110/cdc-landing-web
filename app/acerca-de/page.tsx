import type { Metadata } from "next";
import { AboutBand } from "@/components/about-band";

export const metadata: Metadata = {
  title: "ACERCA DE",
};

export default function AcercaDePage() {
  return <AboutBand />;
}
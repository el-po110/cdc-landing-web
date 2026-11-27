import type { Metadata } from "next";
import { MusicPlayer } from "@/components/music-player";

export const metadata: Metadata = {
  title: "Reproductor",
};

export default function ReproductorPage() {
  return <MusicPlayer />;
}

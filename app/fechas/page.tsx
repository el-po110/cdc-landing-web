import type { Metadata } from "next";
import { InteriorPage } from "@/components/interior-page";

export const metadata: Metadata = {
  title: "FECHAS",
};

export default function FechasPage() {
  return <InteriorPage title="FECHAS" slot="{{FECHAS}}" />;
}

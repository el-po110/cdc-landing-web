import type { Metadata } from "next";
import { InteriorPage } from "@/components/interior-page";

export const metadata: Metadata = {
  title: "CONTACTO",
};

export default function ContactoPage() {
  return <InteriorPage title="CONTACTO" slot="{{CONTACTO}}" />;
}

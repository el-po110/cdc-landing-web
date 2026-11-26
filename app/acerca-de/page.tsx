import type { Metadata } from "next";
import { InteriorPage } from "@/components/interior-page";

export const metadata: Metadata = {
  title: "ACERCA DE",
};

export default function AcercaDePage() {
  return <InteriorPage title="ACERCA DE" slot="{{ACERCA}}" />;
}
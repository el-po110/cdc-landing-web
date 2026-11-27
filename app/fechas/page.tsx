import type { Metadata } from "next";
import { ShowDates } from "@/components/show-dates";

export const metadata: Metadata = {
  title: "FECHAS",
};

export default function FechasPage() {
  return <ShowDates />;
}

import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "CONTACTO",
};

export default function ContactoPage() {
  return <ContactForm />;
}

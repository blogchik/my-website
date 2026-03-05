import type { Metadata } from "next";
import { ToolsHub } from "@/components/tools-hub";

export const metadata: Metadata = {
  title: "Tools Hub — J. Abduroziq",
  description:
    "Free online developer tools — UUID Generator, JWT Decoder, Password Generator, and more. No sign-up, no limits.",
};

export default function ToolsPage() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16">
      <h1 className="font-bold text-[2.75rem] md:text-[4.5rem] text-navy leading-[1.05] tracking-tight mb-12 animate-fade-up">
        Tools Hub.
      </h1>

      <ToolsHub />
    </section>
  );
}

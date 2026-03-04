import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { socials } from "@/lib/constants";
import { ArrowRightUpIcon } from "@/components/icons/arrow-right-up";

export const metadata: Metadata = {
  title: "Contact — J. Abduroziq",
  description: "Get in touch with Jabborov Abduroziq.",
};

export default function ContactPage() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16">
      <h1 className="font-bold text-[2.75rem] md:text-[4.5rem] text-navy leading-[1.05] tracking-tight mb-12 animate-fade-up">
        Get In Touch.
      </h1>

      <ContactForm />

      <div
        className="mt-16 space-y-6 text-sm animate-fade-up"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="space-y-3 text-navy/50">
          <p>Or reach me at:</p>
          <a
            href="mailto:hello@abduroziq.com"
            className="block text-navy hover:text-orange hover:translate-x-2 transition-all duration-300"
          >
            hello@abduroziq.com
          </a>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          {socials.map((social, i) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-1.5 text-navy border-b border-navy/20 pb-0.5 hover:text-orange hover:border-orange hover:translate-x-1 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${0.6 + i * 0.05}s` }}
            >
              {social.label}
              <ArrowRightUpIcon
                width={14}
                height={14}
                className="opacity-40 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all duration-300"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

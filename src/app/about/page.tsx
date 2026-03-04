import type { Metadata } from "next";
import { socials } from "@/lib/constants";
import { ArrowRightUpIcon } from "@/components/icons/arrow-right-up";

export const metadata: Metadata = {
  title: "About — J. Abduroziq",
  description: "Learn more about Jabborov Abduroziq.",
};

const skills = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "Python",
  "Docker",
  "PostgreSQL",
  "Git",
  "Figma",
];

export default function AboutPage() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16">
      <h1 className="font-bold text-[2.75rem] md:text-[4.5rem] text-navy leading-[1.05] tracking-tight mb-12 animate-fade-up">
        About.
      </h1>

      <div className="max-w-2xl space-y-6 text-navy/80 leading-relaxed">
        <p className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Hi, I&apos;m <span className="text-navy font-bold">Jabborov Abduroziq</span> — a
          developer and designer passionate about building meaningful digital
          experiences.
        </p>
        <p className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          I believe in thinking beyond limits and pushing the boundaries of
          what&apos;s possible on the web. My work focuses on creating clean,
          performant, and accessible applications.
        </p>
        <p className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
          When I&apos;m not coding, you&apos;ll find me exploring new technologies,
          contributing to open-source projects, and sharing knowledge with the
          community.
        </p>
      </div>

      <div className="mt-16 animate-fade-up" style={{ animationDelay: "0.4s" }}>
        <h2 className="font-bold text-xl text-navy mb-6">Skills & Tools</h2>
        <div className="flex flex-wrap gap-3">
          {skills.map((skill, i) => (
            <span
              key={skill}
              className="border border-navy/20 text-navy text-sm px-4 py-2 rounded-full hover:border-orange hover:text-orange hover:scale-105 active:scale-95 transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${0.5 + i * 0.05}s` }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-16 animate-fade-up" style={{ animationDelay: "0.6s" }}>
        <h2 className="font-bold text-xl text-navy mb-6">Connect</h2>
        <div className="flex flex-wrap gap-4">
          {socials.map((social, i) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-1.5 text-sm text-navy border-b border-navy/20 pb-0.5 hover:text-orange hover:border-orange hover:translate-x-1 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${0.7 + i * 0.05}s` }}
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

import type { Metadata } from "next";
// import { ProjectCard } from "@/components/project-card";

export const metadata: Metadata = {
  title: "Projects — J. Abduroziq",
  description: "Projects and work by Jabborov Abduroziq.",
};

// const projects = [
//   {
//     title: "Project Alpha",
//     description:
//       "A modern web application built with cutting-edge technologies for seamless user experience.",
//     tags: ["Next.js", "TypeScript", "Tailwind"],
//     href: "#",
//   },
//   {
//     title: "Project Beta",
//     description:
//       "An open-source tool designed to simplify developer workflows and boost productivity.",
//     tags: ["React", "Node.js", "PostgreSQL"],
//     href: "#",
//   },
//   {
//     title: "Project Gamma",
//     description:
//       "A design system and component library for building consistent, accessible interfaces.",
//     tags: ["Figma", "React", "Storybook"],
//     href: "#",
//   },
//   {
//     title: "Project Delta",
//     description:
//       "A high-performance API service with real-time data processing capabilities.",
//     tags: ["Python", "Docker", "Redis"],
//     href: "#",
//   },
// ];

export default function ProjectsPage() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16 flex flex-col">
      <h1 className="font-bold text-[2.75rem] md:text-[4.5rem] text-navy leading-[1.05] tracking-tight mb-12 animate-fade-up">
        Projects.
      </h1>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center -mt-12">
        <span
          className="inline-block border border-orange/30 text-orange text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          Coming Soon
        </span>
        <p
          className="text-navy/50 text-lg md:text-xl leading-relaxed animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Something interesting is brewing here.
          <br />
          Big ideas take a little time — stay tuned.
        </p>
        <div
          className="mt-8 flex items-center gap-2 text-navy/20 animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <span className="w-8 h-px bg-navy/20" />
          <span className="text-xs tracking-widest uppercase">Stay curious</span>
          <span className="w-8 h-px bg-navy/20" />
        </div>
      </div>
    </section>
  );
}

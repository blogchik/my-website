import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";

export const metadata: Metadata = {
  title: "Projects — J. Abduroziq",
  description: "Projects and work by Jabborov Abduroziq.",
};

const projects = [
  {
    title: "Project Alpha",
    description:
      "A modern web application built with cutting-edge technologies for seamless user experience.",
    tags: ["Next.js", "TypeScript", "Tailwind"],
    href: "#",
  },
  {
    title: "Project Beta",
    description:
      "An open-source tool designed to simplify developer workflows and boost productivity.",
    tags: ["React", "Node.js", "PostgreSQL"],
    href: "#",
  },
  {
    title: "Project Gamma",
    description:
      "A design system and component library for building consistent, accessible interfaces.",
    tags: ["Figma", "React", "Storybook"],
    href: "#",
  },
  {
    title: "Project Delta",
    description:
      "A high-performance API service with real-time data processing capabilities.",
    tags: ["Python", "Docker", "Redis"],
    href: "#",
  },
];

export default function ProjectsPage() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16">
      <h1 className="font-bold text-[2.75rem] md:text-[4.5rem] text-navy leading-[1.05] tracking-tight mb-12 animate-fade-up">
        Projects.
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {projects.map((project, i) => (
          <ProjectCard key={project.title} {...project} index={i} />
        ))}
      </div>
    </section>
  );
}

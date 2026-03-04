import { ArrowRightUpIcon } from "@/components/icons/arrow-right-up";

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  href: string;
  index: number;
}

export function ProjectCard({ title, description, tags, href, index }: ProjectCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border border-navy/10 rounded-2xl p-6 hover:border-orange/50 hover:shadow-lg hover:shadow-orange/5 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-lg text-navy group-hover:text-orange transition-colors duration-300">
          {title}
        </h3>
        <ArrowRightUpIcon
          width={20}
          height={20}
          className="text-navy/30 group-hover:text-orange group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 shrink-0 mt-1"
        />
      </div>
      <p className="text-sm text-navy/60 mb-4 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs border border-navy/10 text-navy/50 px-3 py-1 rounded-full group-hover:border-orange/20 group-hover:text-navy/70 transition-all duration-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}

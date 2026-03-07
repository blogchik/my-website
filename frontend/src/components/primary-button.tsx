import Link from "next/link";
import { ArrowRightUpIcon } from "@/components/icons/arrow-right-up";

const baseClass =
  "inline-flex items-center gap-3 bg-orange rounded-full pl-6 pr-2 py-2 font-medium text-white group hover:shadow-lg hover:shadow-orange/25 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300";

function ArrowBadge() {
  return (
    <span className="bg-white rounded-full p-2 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
      <ArrowRightUpIcon width={20} height={20} className="text-orange" />
    </span>
  );
}

interface PrimaryLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function PrimaryLink({ href, children, className, style }: PrimaryLinkProps) {
  return (
    <Link href={href} className={`${baseClass}${className ? ` ${className}` : ""}`} style={style}>
      <span>{children}</span>
      <ArrowBadge />
    </Link>
  );
}

interface PrimaryButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function PrimaryButton({ children, disabled, className, style }: PrimaryButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`${baseClass} cursor-pointer disabled:opacity-50 disabled:pointer-events-none${className ? ` ${className}` : ""}`}
      style={style}
    >
      <span>{children}</span>
      <ArrowBadge />
    </button>
  );
}

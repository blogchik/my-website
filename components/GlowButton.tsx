import { type ButtonHTMLAttributes } from "react";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function GlowButton({
  children,
  className = "",
  ...props
}: GlowButtonProps) {
  return (
    <div className="group relative inline-flex">
      {/* Glow underlay */}
      <div
        aria-hidden="true"
        className="absolute inset-x-2 -bottom-2 h-6 rounded-full bg-gradient-to-r from-amber-400 via-orange-300 to-violet-500 opacity-60 blur-xl transition-all duration-200 ease-out group-hover:scale-105 group-hover:opacity-80"
      />
      {/* Button */}
      <button
        className={`relative z-10 cursor-pointer rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${className}`}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}

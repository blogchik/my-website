import { type SVGProps } from "react";

export function AddCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M22.5 18L18 18M18 18L13.5 18M18 18L18 13.5M18 18L18 22.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

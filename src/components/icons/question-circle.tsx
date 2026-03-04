import { type SVGProps } from "react";

export function QuestionCircleIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M15.1875 13.3125C15.1875 11.7592 16.4467 10.5 18 10.5C19.5533 10.5 20.8125 11.7592 20.8125 13.3125C20.8125 14.3437 20.2576 15.2452 19.43 15.7348C18.7171 16.1566 18 16.7966 18 17.625V19.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="24" r="1.5" fill="currentColor" />
    </svg>
  );
}

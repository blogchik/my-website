import type { Metadata } from "next"
import { NotFoundContent } from "@/components/not-found-content"

export const metadata: Metadata = {
  title: "404 Not Found",
}

export default function NotFound() {
  return <NotFoundContent />
}

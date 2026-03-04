import GlowButton from "@/components/GlowButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="flex min-h-screen items-center justify-center">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h1 className="font-heading text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px] lg:text-[52px]">
            Rebooting the
            <br />
            Creative Connection.
          </h1>

          <p className="mx-auto mt-6 max-w-[560px] text-sm leading-relaxed text-zinc-500 sm:text-base">
            We&apos;re not building another platform. We&apos;re building a
            place where people belong.
          </p>

          <div className="mt-8">
            <GlowButton>Join our World</GlowButton>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { getOAuthState, clearOAuthState, setAccessToken } from "@/lib/auth";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const initiated = useRef(false);

  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");

    if (!code) {
      router.push("/login");
      return;
    }

    const savedState = getOAuthState();
    clearOAuthState();

    if (!savedState || savedState !== returnedState) {
      router.replace("/login?error=state_mismatch");
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

    fetch(`${apiUrl}/admin/auth/github/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Authentication failed");
        }
        return res.json();
      })
      .then((data) => {
        setAccessToken(data.access_token);
        router.push("/dashboard");
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-fade-up text-center space-y-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-navy/40 hover:text-orange transition-colors cursor-pointer"
          >
            back to login_
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-fade-in text-center space-y-4">
        <div className="w-3 h-3 bg-orange rounded-full mx-auto animate-pulse" />
        <p className="text-navy/40 text-sm">authenticating...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-3 h-3 bg-orange rounded-full animate-pulse" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}

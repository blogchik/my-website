"use client";

import { useState, type FormEvent } from "react";
import { PrimaryButton } from "@/components/primary-button";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("sending");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    try {
      const res = await fetch(`${apiUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });

      if (!res.ok) throw new Error("Failed to send");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="border border-orange/30 rounded-2xl p-8 text-center animate-scale-in">
        <p className="text-navy font-bold text-lg mb-2">Message sent!</p>
        <p className="text-navy/60 text-sm">
          Thank you for reaching out. I&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-xl">
      <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <label
          htmlFor="name"
          className={`block text-sm mb-2 transition-colors duration-300 ${
            focused === "name" ? "text-orange" : "text-navy/60"
          }`}
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          onFocus={() => setFocused("name")}
          onBlur={() => setFocused(null)}
          className="w-full bg-transparent border-b-2 border-navy/20 pb-2 text-navy outline-none focus:border-orange transition-all duration-300 placeholder:text-navy/30"
          placeholder="Your name"
        />
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <label
          htmlFor="email"
          className={`block text-sm mb-2 transition-colors duration-300 ${
            focused === "email" ? "text-orange" : "text-navy/60"
          }`}
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          onFocus={() => setFocused("email")}
          onBlur={() => setFocused(null)}
          className="w-full bg-transparent border-b-2 border-navy/20 pb-2 text-navy outline-none focus:border-orange transition-all duration-300 placeholder:text-navy/30"
          placeholder="your@email.com"
        />
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <label
          htmlFor="message"
          className={`block text-sm mb-2 transition-colors duration-300 ${
            focused === "message" ? "text-orange" : "text-navy/60"
          }`}
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          rows={4}
          onFocus={() => setFocused("message")}
          onBlur={() => setFocused(null)}
          className="w-full bg-transparent border-b-2 border-navy/20 pb-2 text-navy outline-none focus:border-orange transition-all duration-300 resize-none placeholder:text-navy/30"
          placeholder="Your message..."
        />
        <p className="text-xs text-navy/30 mt-1">Minimum 10 characters</p>
      </div>

      {status === "error" && (
        <p className="text-red-500 text-sm animate-fade-up">
          Something went wrong. Please try again or email me directly.
        </p>
      )}

      <PrimaryButton
        disabled={status === "sending"}
        className="animate-fade-up"
        style={{ animationDelay: "0.4s" }}
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </PrimaryButton>
    </form>
  );
}

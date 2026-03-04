import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  // TODO: Integrate with an email service (Resend, SendGrid, etc.)
  // For now, log the message server-side so no data is silently lost
  console.log("[Contact Form]", { name, email, message, date: new Date().toISOString() });

  return NextResponse.json({ success: true });
}

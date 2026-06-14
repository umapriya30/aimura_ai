import { NextResponse } from "next/server";
import { createPasswordReset } from "@/lib/app-data-store";

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json({ success: false, message: "Please enter your email address." }, { status: 400 });
  }

  const result = await createPasswordReset(email);
  // Relative path so it resolves on the visitor's own host (tunnel/localhost).
  const resetLink = result.resetToken
    ? `/api/auth/reset-password?token=${encodeURIComponent(result.resetToken)}`
    : undefined;

  // Always succeed and return a local reset link when one exists. The app does
  // not depend on an email provider for demos.
  return NextResponse.json({
    success: true,
    message: result.message,
    resetLink,
  });
}

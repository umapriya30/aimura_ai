import { NextResponse } from "next/server";
import { createUser } from "@/lib/app-data-store";

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return NextResponse.json({ success: false, message: "Please provide your name, email, and password." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ success: false, message: "Use at least 8 characters for the password." }, { status: 400 });
  }

  const result = await createUser(name, email, password);
  if (!result.success) {
    return NextResponse.json(result, { status: 409 });
  }

  return NextResponse.json(result);
}

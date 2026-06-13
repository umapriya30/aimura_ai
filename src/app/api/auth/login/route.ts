import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/app-data-store";

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ success: false, message: "Please provide your email and password." }, { status: 400 });
  }

  const result = await authenticateUser(email, password);
  if (!result.success) {
    return NextResponse.json(result, { status: 401 });
  }

  return NextResponse.json(result);
}

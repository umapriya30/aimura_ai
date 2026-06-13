import { NextResponse } from "next/server";
import { getReportsForUser } from "@/lib/app-data-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") || "";

  if (!userId) {
    return NextResponse.json({ success: false, message: "A user id is required." }, { status: 400 });
  }

  const reports = await getReportsForUser(userId);
  return NextResponse.json({ success: true, reports });
}

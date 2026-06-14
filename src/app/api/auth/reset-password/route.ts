import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/app-data-store";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  // Relative action so the form posts back to the visitor's host (tunnel/localhost).
  const action = "/api/auth/reset-password";

  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reset Aimura Password</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #020817; color: #f7fbff; font-family: ui-sans-serif, system-ui, sans-serif; }
      form { width: min(92vw, 560px); border: 1px solid rgba(44,230,161,.35); border-radius: 24px; padding: 32px; background: linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.03)); box-shadow: 0 24px 80px rgba(0,0,0,.4); }
      label, input, button { display: block; width: 100%; }
      .eyebrow { color: #2ce6a1; font-size: 12px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
      h1 { margin: 12px 0 18px; font-size: 32px; line-height: 1; }
      label { color: #bdd1df; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
      input { box-sizing: border-box; margin-top: 10px; border: 1px solid rgba(125,147,170,.38); border-radius: 16px; background: #102b49; color: #fff; padding: 14px; font-size: 16px; }
      button { margin-top: 18px; border: 0; border-radius: 999px; background: #2ce6a1; color: #020817; padding: 14px 18px; font-weight: 800; cursor: pointer; }
    </style>
  </head>
  <body>
    <form method="post" action="${action}">
      <div class="eyebrow">Password reset</div>
      <h1>Create a new password.</h1>
      <input type="hidden" name="token" value="${escapeHtml(token)}" />
      <label>New password
        <input name="password" type="password" minlength="8" required placeholder="At least 8 characters" />
      </label>
      <button type="submit">Update password</button>
    </form>
  </body>
</html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let token = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    token = typeof body?.token === "string" ? body.token : "";
    password = typeof body?.password === "string" ? body.password : "";
  } else {
    const body = await request.formData();
    token = String(body.get("token") || "");
    password = String(body.get("password") || "");
  }

  if (!token || password.length < 8) {
    return NextResponse.json({ success: false, message: "Use a valid reset link and a password of at least 8 characters." }, { status: 400 });
  }

  const result = await resetPassword(token, password);
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  if (contentType.includes("application/json")) return NextResponse.json(result);
  // Relative so it returns the visitor to login on their own host (tunnel/localhost).
  const loginUrl = "/?auth=login&amp;reset=1";

  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta http-equiv="refresh" content="1.5;url=${loginUrl}" /><title>Password Updated</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#020817;color:#f7fbff;font-family:ui-sans-serif,system-ui,sans-serif}main{width:min(92vw,520px);border:1px solid rgba(44,230,161,.35);border-radius:24px;padding:32px;background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.03))}a{display:inline-flex;margin-top:18px;border-radius:999px;background:#2ce6a1;color:#020817;padding:12px 18px;font-weight:800;text-decoration:none}p{color:#bdd1df}</style></head><body><main><h1>Password updated.</h1><p>Taking you back to login. Sign in with the new password.</p><a href="${loginUrl}">Go to login</a></main></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[char] || char;
  });
}

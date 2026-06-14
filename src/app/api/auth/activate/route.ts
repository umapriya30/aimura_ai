import { activateUser } from "@/lib/app-data-store";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const result = token ? await activateUser(token) : { success: false, message: "Missing activation token." };
  // Relative URL so it resolves against the host the visitor is actually on
  // (e.g. a public tunnel URL), not the server's internal localhost.
  const loginUrl = "/?auth=login&amp;activated=1";

  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${result.success ? `<meta http-equiv="refresh" content="1.5;url=${loginUrl}" />` : ""}
    <title>Aimura Profile Activation</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #020817; color: #f7fbff; font-family: ui-sans-serif, system-ui, sans-serif; }
      main { width: min(92vw, 560px); border: 1px solid rgba(44,230,161,.35); border-radius: 24px; padding: 32px; background: linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.03)); box-shadow: 0 24px 80px rgba(0,0,0,.4); }
      .eyebrow { color: #2ce6a1; font-size: 12px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
      h1 { margin: 12px 0; font-size: 32px; line-height: 1; }
      p { color: #bdd1df; line-height: 1.7; }
      a { display: inline-flex; margin-top: 18px; border-radius: 999px; background: #2ce6a1; color: #020817; padding: 12px 18px; font-weight: 700; text-decoration: none; }
    </style>
  </head>
  <body>
    <main>
      <div class="eyebrow">${result.success ? "Profile activated" : "Activation issue"}</div>
      <h1>${result.success ? "Your Aimura profile is active." : "We could not activate this link."}</h1>
      <p>${escapeHtml(result.message || "Please request a fresh activation link.")}</p>
      <a href="${loginUrl}">${result.success ? "Go to login" : "Return to Aimura AI"}</a>
    </main>
  </body>
</html>`,
    { headers: { "content-type": "text/html; charset=utf-8" }, status: result.success ? 200 : 400 },
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[char] || char;
  });
}

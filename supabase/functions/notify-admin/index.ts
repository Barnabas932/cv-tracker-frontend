// supabase/functions/notify-admin/index.ts
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
    const APP_URL = Deno.env.get("APP_URL") ?? "";

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Missing ADMIN_EMAIL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const userEmail = String(body?.email ?? "").trim();
    const userId = String(body?.user_id ?? "").trim();

    if (!userEmail) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(RESEND_API_KEY);

    const approveLink = APP_URL
      ? `${APP_URL}/admin?email=${encodeURIComponent(userEmail)}${
          userId ? `&user_id=${encodeURIComponent(userId)}` : ""
        }`
      : "";

    const subject = "Új regisztráció – jóváhagyás szükséges (CV Tracker demo)";
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Új regisztráció érkezett</h2>
        <p><b>Email:</b> ${userEmail}</p>
        ${userId ? `<p><b>User ID:</b> ${userId}</p>` : ""}
        ${
          approveLink
            ? `<p><a href="${approveLink}">Megnyitás admin felületen</a></p>`
            : `<p><i>APP_URL nincs beállítva, ezért nincs admin link.</i></p>`
        }
        <hr/>
        <p>Megjegyzés: Ez egy demo / referencia projekt, csak jóváhagyott felhasználók tölthetnek fel.</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: "CV Tracker <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject,
      html,
    });

    if (error) {
      return new Response(JSON.stringify({ ok: false, resend_error: error }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

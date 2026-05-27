import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (uses service role if available, else anon)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Helper: Parse multilingual JSON
function parseMultiLang(value: string | null) {
  if (!value) return { en: "", si: "", ta: "" };
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && "en" in parsed) {
      return { en: parsed.en ?? "", si: parsed.si ?? "", ta: parsed.ta ?? "" };
    }
  } catch {}
  return { en: value, si: "", ta: "" };
}

export async function POST(req: NextRequest) {
  try {
    const { alert_id } = await req.json();
    if (!alert_id) {
      return NextResponse.json({ success: false, error: "alert_id is required" }, { status: 400 });
    }

    // 1. Fetch the alert
    const { data: alert, error: alertErr } = await supabase
      .from("alert")
      .select("*, alert_type(*)")
      .eq("id", alert_id)
      .single();

    if (alertErr || !alert) {
      return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 });
    }

    // 2. Get target player IDs (optional district filter)
    let tokenQuery = supabase
      .from("device_token")
      .select("player_id, language")
      .eq("is_active", true);

    if (alert.district_id) {
      tokenQuery = tokenQuery.or(`district_id.eq.${alert.district_id},district_id.is.null`);
    }

    const { data: tokens, error: tokenErr } = await tokenQuery;
    if (tokenErr) throw tokenErr;

    if (!tokens || tokens.length === 0) {
      await supabase.from("notification_log").insert({
        alert_id,
        success_count: 0,
        failure_count: 0,
        total_tokens: 0,
        error_message: "No active devices",
      });
      return NextResponse.json({ success: true, total: 0, message: "No devices to notify" });
    }

    // 3. Parse multilingual content
    const titles = parseMultiLang(alert.title);
    const bodies = parseMultiLang(alert.alert);

    // 4. Send to OneSignal
    // OneSignal supports multilingual content natively!
    const playerIds = tokens.map((t) => t.player_id);

    const oneSignalRes = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: playerIds,
        // Multilingual headings and content
        headings: {
          en: titles.en || "Alert",
          si: titles.si || titles.en || "Alert",
          ta: titles.ta || titles.en || "Alert",
        },
        contents: {
          en: bodies.en || "",
          si: bodies.si || bodies.en || "",
          ta: bodies.ta || bodies.en || "",
        },
        // Custom data sent to app
        data: {
          alert_id: alert.id,
          alert_type: alert.alert_type?.type ?? "info",
          url: alert.url ?? "",
        },
        // Android specifics
        android_channel_id: "emergency_alerts",
        priority: 10,
        // iOS specifics
        ios_sound: "default",
        ios_badgeType: "Increase",
        ios_badgeCount: 1,
      }),
    });

    const result = await oneSignalRes.json();

    if (!oneSignalRes.ok) {
      await supabase.from("notification_log").insert({
        alert_id,
        success_count: 0,
        failure_count: tokens.length,
        total_tokens: tokens.length,
        error_message: JSON.stringify(result),
      });
      return NextResponse.json(
        { success: false, error: result.errors ?? "OneSignal request failed", details: result },
        { status: 500 },
      );
    }

    // 5. Log result
    await supabase.from("notification_log").insert({
      alert_id,
      success_count: result.recipients ?? 0,
      failure_count: tokens.length - (result.recipients ?? 0),
      total_tokens: tokens.length,
      onesignal_id: result.id,
    });

    // 6. Mark alert as sent
    await supabase.from("alert").update({ send: true }).eq("id", alert_id);

    return NextResponse.json({
      success: true,
      total: tokens.length,
      recipients: result.recipients ?? 0,
      onesignal_id: result.id,
    });
  } catch (err) {
    console.error("Notification error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
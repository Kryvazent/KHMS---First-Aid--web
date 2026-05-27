import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const { title, message, district_id, target } = await req.json();

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "Title and message are required" },
        { status: 400 },
      );
    }

    // Build query for target devices
    let tokenQuery = supabase
      .from("device_token")
      .select("token, language")
      .eq("is_active", true);

    if (target === "district" && district_id) {
      tokenQuery = tokenQuery.eq("district_id", district_id);
    }

    const { data: tokens } = await tokenQuery;

    if (!tokens || tokens.length === 0) {
      await supabase.from("notification_log").insert({
        alert_id: null,
        title,
        message,
        success_count: 0,
        failure_count: 0,
        total_tokens: 0,
        error_message: "No active devices",
      });
      return NextResponse.json({
        success: true,
        total: 0,
        message: "No active devices to notify",
      });
    }

    const playerIds = tokens.map((t) => t.token).filter(Boolean);

    const oneSignalRes = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: playerIds,
        headings: { en: title },
        contents: { en: message },
        data: { type: "test", source: "admin_test" },
        priority: 10,
      }),
    });

    const result = await oneSignalRes.json();

    if (!oneSignalRes.ok) {
      await supabase.from("notification_log").insert({
        alert_id: null,
        title,
        message,
        success_count: 0,
        failure_count: tokens.length,
        total_tokens: tokens.length,
        error_message: JSON.stringify(result),
      });
      return NextResponse.json(
        { success: false, error: result.errors ?? "OneSignal request failed" },
        { status: 500 },
      );
    }

    const delivered = typeof result.recipients === "number" ? result.recipients : playerIds.length;

    await supabase.from("notification_log").insert({
      alert_id: null,
      title,
      message,
      success_count: delivered,
      failure_count: tokens.length - delivered,
      total_tokens: tokens.length,
    });

    return NextResponse.json({
      success: true,
      total: tokens.length,
      recipients: delivered,
      onesignal_id: result.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
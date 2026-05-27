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
      .select("player_id, language")
      .eq("is_active", true);

    if (target === "district" && district_id) {
      tokenQuery = tokenQuery.eq("district_id", district_id);
    } else if (target === "test") {
      // Send to last 1 device for testing
      tokenQuery = tokenQuery.order("last_active", { ascending: false }).limit(1);
    }

    const { data: tokens } = await tokenQuery;

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({
        success: true,
        total: 0,
        message: "No active devices to notify",
      });
    }

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
        headings: { en: title },
        contents: { en: message },
        data: { type: "test", source: "admin_test" },
        android_channel_id: "emergency_alerts",
        priority: 10,
      }),
    });

    const result = await oneSignalRes.json();

    if (!oneSignalRes.ok) {
      return NextResponse.json(
        { success: false, error: result.errors ?? "OneSignal request failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      total: tokens.length,
      recipients: result.recipients ?? 0,
      onesignal_id: result.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
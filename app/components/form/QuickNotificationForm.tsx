"use client";

import React, { useState, useEffect } from "react";
import { MdSend, MdInfoOutline } from "react-icons/md";
import { supabase } from "@/app/lib/supabase";
import { District } from "@/app/types";

type TargetType = "all" | "district";

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
};

export default function QuickNotificationForm({ onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<TargetType>("all");
  const [districtId, setDistrictId] = useState<number | "">("");
  const [districts, setDistricts] = useState<District[]>([]);
  const [activeDeviceCount, setActiveDeviceCount] = useState(0);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    async function load() {
      const [districtsRes, deviceCountRes] = await Promise.all([
        supabase.from("district").select("*").order("name"),
        supabase
          .from("device_token")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
      ]);
      if (districtsRes.data) setDistricts(districtsRes.data as District[]);
      if (deviceCountRes.count !== null) setActiveDeviceCount(deviceCountRes.count);
    }
    load();
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required.";
    else if (title.trim().length > 60) e.title = "Title must be 60 characters or less.";
    if (!message.trim()) e.message = "Message is required.";
    else if (message.trim().length > 200) e.message = "Message must be 200 characters or less.";
    if (target === "district" && !districtId) e.district = "Please select a district.";
    return e;
  }

  async function handleSend() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/send-test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          target,
          district_id: target === "district" ? Number(districtId) : null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setResult({
          success: true,
          msg: `✓ Notification sent to ${data.recipients ?? data.total ?? 0} device${data.recipients === 1 ? "" : "s"}`,
        });
        // Reset form
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setResult({ success: false, msg: data.error ?? "Failed to send" });
      }
    } catch (err) {
      setResult({
        success: false,
        msg: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Info banner */}
      <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3">
        <MdInfoOutline className="text-blue-500 text-lg shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 leading-relaxed">
          <p className="font-semibold mb-0.5">Quick Notification</p>
          <p>
            Send a one-off push notification without creating a full alert record.
            Currently <span className="font-bold">{activeDeviceCount}</span> device
            {activeDeviceCount === 1 ? "" : "s"} active.
          </p>
        </div>
      </div>

      {/* Result feedback */}
      {result && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            result.success
              ? "bg-green-50 border-green-100 text-green-700"
              : "bg-red-50 border-red-100 text-red-700"
          }`}
        >
          {result.msg}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Title <span className="text-red-500">*</span>
          <span className="ml-2 text-xs font-normal text-gray-400">
            {title.length}/60
          </span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors({ ...errors, title: "" });
          }}
          placeholder="e.g. Severe Weather Alert"
          maxLength={70}
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 ${
            errors.title
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200 focus:border-red-400 focus:ring-red-100"
          }`}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Message */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Message <span className="text-red-500">*</span>
          <span className="ml-2 text-xs font-normal text-gray-400">
            {message.length}/200
          </span>
        </label>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) setErrors({ ...errors, message: "" });
          }}
          placeholder="What do you want to tell users?"
          rows={3}
          maxLength={220}
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 resize-none ${
            errors.message
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200 focus:border-red-400 focus:ring-red-100"
          }`}
        />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
      </div>

      {/* Target */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">Target Audience</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTarget("all")}
            className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all ${
              target === "all"
                ? "border-red-400 bg-red-50 text-red-600"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            }`}
          >
            <span className="text-xl">🌍</span>
            <span className="text-xs font-semibold">All Users</span>
          </button>
          <button
            type="button"
            onClick={() => setTarget("district")}
            className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all ${
              target === "district"
                ? "border-red-400 bg-red-50 text-red-600"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            }`}
          >
            <span className="text-xl">📍</span>
            <span className="text-xs font-semibold">District</span>
          </button>
        </div>
      </div>

      {/* District selector */}
      {target === "district" && (
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            Select District <span className="text-red-500">*</span>
          </label>
          <select
            value={districtId}
            onChange={(e) => {
              setDistrictId(e.target.value ? Number(e.target.value) : "");
              if (errors.district) setErrors({ ...errors, district: "" });
            }}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 ${
              errors.district
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-gray-200 focus:border-red-400 focus:ring-red-100"
            }`}
          >
            <option value="">Choose a district...</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.province})</option>
            ))}
          </select>
          {errors.district && <p className="mt-1 text-xs text-red-500">{errors.district}</p>}
        </div>
      )}

      {/* Preview */}
      {(title || message) && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Preview
          </label>
          <div className="bg-gray-900 rounded-2xl p-4 shadow-lg">
            <div className="bg-white rounded-xl p-3 flex gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
                <MdSend className="text-white" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 mb-0.5">First Aid • now</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {title || "Notification title"}
                </p>
                <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                  {message || "Notification body will appear here..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={submitting || activeDeviceCount === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:bg-red-300"
        >
          {submitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <MdSend size={16} />
          )}
          {submitting ? "Sending..." : "Send Now"}
        </button>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "../../lib/iconMap";
import { supabase } from "../../lib/supabase";
import { AlertType, Audience, District, AlertRow, Language, MultiLangText } from "../../types";
import LanguageTabs from "../ui/LanguageTabs";

type AlertFormData = {
  title: MultiLangText;
  alert: MultiLangText;
  alert_type_id: number | "";
  audience_id: number | "";
  district_id: number | "";
  url: string;
  send: boolean;
  schedule: boolean;
  send_at: string;
};

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

const EMPTY_MULTILANG: MultiLangText = { en: "", si: "", ta: "" };

export default function AlertForm({
  onClose,
  alert,
  onSuccess,
}: {
  onClose: () => void;
  alert?: AlertRow;
  onSuccess?: () => void;
}) {
  const isEdit = !!alert;
  const [lang, setLang] = useState<Language>("en");

  const [alertTypes, setAlertTypes] = useState<AlertType[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [form, setForm] = useState<AlertFormData>({
    title: alert
      ? { en: alert.title, si: alert.title_si ?? "", ta: alert.title_ta ?? "" }
      : { ...EMPTY_MULTILANG },
    alert: alert
      ? { en: alert.alert, si: alert.alert_si ?? "", ta: alert.alert_ta ?? "" }
      : { ...EMPTY_MULTILANG },
    alert_type_id: alert?.alert_type_id ?? "",
    audience_id: alert?.audience_id ?? "",
    district_id: alert?.district_id ?? "",
    url: alert?.url ?? "",
    send: alert?.send ?? false,
    schedule: false,
    send_at: "",
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      setLoadingMeta(true);
      const [typesRes, audiencesRes, districtsRes] = await Promise.all([
        supabase.from("alert_type").select("*"),
        supabase.from("audience").select("*"),
        supabase.from("district").select("*"),
      ]);
      if (typesRes.data) setAlertTypes(typesRes.data as AlertType[]);
      if (audiencesRes.data) setAudiences(audiencesRes.data as Audience[]);
      if (districtsRes.data) setDistricts(districtsRes.data as District[]);
      setLoadingMeta(false);
    }
    loadMeta();
  }, []);

  async function triggerNotification(alertId: number) {
    try {
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert_id: alertId }),
      });
      return await res.json();
    } catch (err) {
      console.error("Notification failed:", err);
      return { success: false };
    }
  }

  function setMultiLang(field: "title" | "alert", value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
    if (errors[`${field}_${lang}`]) {
      setErrors((prev) => ({ ...prev, [`${field}_${lang}`]: undefined }));
    }
  }

  function handleChange(field: keyof AlertFormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function localizedLabel(value: string, si?: string | null, ta?: string | null) {
    if (lang === "si") return si || value;
    if (lang === "ta") return ta || value;
    return value;
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.en.trim()) e["title_en"] = "English title is required.";
    if (!form.alert.en.trim()) e["alert_en"] = "English message is required.";
    if (!form.alert_type_id) e.alert_type_id = "Please select an alert type.";
    if (!form.audience_id) e.audience_id = "Please select an audience.";
    if (form.schedule && !form.send_at) e.send_at = "Schedule date/time is required.";
    return e;
  }

  async function handleSubmit(asDraft = false) {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSubmitting(true);

    const stored = localStorage.getItem("admin_user");
    const user = stored ? JSON.parse(stored) : { id: 1 };

    const payload = {
      title: form.title.en,
      title_si: form.title.si || null,
      title_ta: form.title.ta || null,
      alert: form.alert.en,
      alert_si: form.alert.si || null,
      alert_ta: form.alert.ta || null,
      alert_type_id: Number(form.alert_type_id),
      audience_id: Number(form.audience_id),
      district_id: form.district_id ? Number(form.district_id) : null,
      url: form.url || null,
      send: asDraft ? false : form.send,
      added_by: user.id,
    };

    let alertId: number | null = null;

    if (isEdit && alert) {
      const { error } = await supabase.from("alert").update(payload).eq("id", alert.id);
      if (error) { console.error(error); setSubmitting(false); return; }
      alertId = alert.id;
    } else {
      const { data, error } = await supabase.from("alert").insert(payload).select("id").single();
      if (error || !data) { console.error(error); setSubmitting(false); return; }
      alertId = data.id;
    }

    if (asDraft && alertId) {
      await supabase.from("alert_draft").insert({ alert_id: alertId });
    }

    if (form.schedule && form.send_at && alertId) {
      await supabase.from("alert_schedule").insert({
        alert_id: alertId,
        send_at: new Date(form.send_at).toISOString(),
      });
    }

    if (alertId && form.send && !asDraft && !form.schedule) {
      const notif = await triggerNotification(alertId);
      if (notif.success) {
        console.log(`Notification sent to ${notif.recipients} devices`);
      }
    }
    setSubmitting(false);
    onSuccess?.();
    onClose();
  }

  if (loadingMeta) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <FieldLabel label="Content Language" />
        <LanguageTabs active={lang} onChange={setLang} />
      </div>

      <div>
        <FieldLabel label={`Title (${lang.toUpperCase()})`} required={lang === "en"} />
        <input
          type="text"
          value={form.title[lang]}
          onChange={(e) => setMultiLang("title", e.target.value)}
          placeholder={
            lang === "si" ? "මාතෘකාව ඇතුළත් කරන්න..." :
              lang === "ta" ? "தலைப்பை உள்ளிடுக..." :
                "e.g. Heat Wave Warning"
          }
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${errors[`title_${lang}`]
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
            }`}
        />
        <ErrorMsg msg={errors[`title_${lang}`]} />
        {lang !== "en" && (
          <p className="mt-1 text-xs text-gray-400">English: {form.title.en || "—"}</p>
        )}
      </div>

      <div>
        <FieldLabel label={`Message (${lang.toUpperCase()})`} required={lang === "en"} />
        <textarea
          value={form.alert[lang]}
          onChange={(e) => setMultiLang("alert", e.target.value)}
          placeholder={
            lang === "si" ? "විස්තරය ඇතුළත් කරන්න..." :
              lang === "ta" ? "விவரங்களை உள்ளிடுக..." :
                "Describe the alert..."
          }
          rows={3}
          className={`w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${errors[`alert_${lang}`]
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
            }`}
        />
        <ErrorMsg msg={errors[`alert_${lang}`]} />
      </div>

      <div>
        <FieldLabel label="Alert Type" required />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {alertTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleChange("alert_type_id", t.id)}
              style={{
                backgroundColor: form.alert_type_id === t.id ? t.color : undefined,
              }}
              className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-2.5 text-xs font-medium transition-all ${form.alert_type_id === t.id
                ? "border-current text-gray-800"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
            >
              <Icon name={t.icon} size={18} />
              {localizedLabel(t.type, t.type_si, t.type_ta)}
            </button>
          ))}
        </div>
        <ErrorMsg msg={errors.alert_type_id} />
      </div>

      <div>
        <FieldLabel label="Audience" required />
        <select
          value={form.audience_id}
          onChange={(e) => handleChange("audience_id", e.target.value)}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${errors.audience_id
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
            }`}
        >
          <option value="">Select audience...</option>
          {audiences.map((a) => (
            <option key={a.id} value={a.id}>{a.audience}</option>
          ))}
        </select>
        <ErrorMsg msg={errors.audience_id} />
      </div>

      <div>
        <FieldLabel label="District (optional)" />
        <select
          value={form.district_id}
          onChange={(e) => handleChange("district_id", e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
        >
          <option value="">All Districts</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {localizedLabel(d.name, d.name_si, d.name_ta)} ({d.province})
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel label="Reference URL (optional)" />
        <input
          type="url"
          value={form.url}
          onChange={(e) => handleChange("url", e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-800">Send Immediately</p>
          <p className="text-xs text-gray-400">Push to all selected audiences now</p>
        </div>
        <button
          type="button"
          onClick={() => handleChange("send", !form.send)}
          className={`relative h-6 w-11 rounded-full transition-colors ${form.send ? "bg-red-500" : "bg-gray-200"
            }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.send ? "translate-x-5" : "translate-x-0"
              }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-800">Schedule Alert</p>
          <p className="text-xs text-gray-400">Send at a specific date/time</p>
        </div>
        <button
          type="button"
          onClick={() => handleChange("schedule", !form.schedule)}
          className={`relative h-6 w-11 rounded-full transition-colors ${form.schedule ? "bg-blue-500" : "bg-gray-200"
            }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.schedule ? "translate-x-5" : "translate-x-0"
              }`}
          />
        </button>
      </div>

      {form.schedule && (
        <div>
          <FieldLabel label="Schedule Date & Time" required />
          <input
            type="datetime-local"
            value={form.send_at}
            onChange={(e) => handleChange("send_at", e.target.value)}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${errors.send_at
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
              }`}
          />
          <ErrorMsg msg={errors.send_at} />
        </div>
      )}

      <div className="flex gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        {!isEdit && (
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={submitting}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Save Draft
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all ${isEdit
            ? "bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300"
            : "bg-red-500 hover:bg-red-600 disabled:bg-red-300"
            }`}
        >
          {submitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : isEdit ? "Save Changes" : "Add Alert"}
        </button>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { MdAdd, MdDelete } from "react-icons/md";
import React from "react";
import { Icon, POPULAR_ICONS } from "../../lib/iconMap";
import { supabase } from "../../lib/supabase";
import { SeverityLevel, EmergencyRow, Language, MultiLangText } from "../../types";
import LanguageTabs from "../ui/LanguageTabs";

const EMPTY_MULTILANG: MultiLangText = { en: "", si: "", ta: "" };

type StepForm = {
  tempId: number;
  step_id: number;
  title: MultiLangText;
  instruction: MultiLangText;
  image_url: string;
  video_url: string;
  icon: string;
  id?: number;
};

type Props = {
  onClose: () => void;
  emergency?: EmergencyRow;
  onSuccess?: () => void;
};

const PRESET_COLORS = [
  "#FEF2F2", "#FFF7ED", "#FFFBEB", "#F0FDF4",
  "#EFF6FF", "#F5F3FF", "#FDF4FF", "#F0FDFA",
];

export default function EmergencyForm({ onClose, emergency, onSuccess }: Props) {
  const isEdit = !!emergency;
  const [lang, setLang] = useState<Language>("en");
  const [severityLevels, setSeverityLevels] = useState<SeverityLevel[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [name, setName] = useState<MultiLangText>(
    emergency
      ? { en: emergency.name, si: emergency.name_si ?? "", ta: emergency.name_ta ?? "" }
      : { ...EMPTY_MULTILANG }
  );
  const [subtitle, setSubtitle] = useState<MultiLangText>(
    emergency
      ? {
        en: emergency.subtitle ?? "",
        si: emergency.subtitle_si ?? "",
        ta: emergency.subtitle_ta ?? "",
      }
      : { ...EMPTY_MULTILANG }
  );
  const [warning, setWarning] = useState<MultiLangText>(
    emergency
      ? {
        en: emergency.warning ?? "",
        si: emergency.warning_si ?? "",
        ta: emergency.warning_ta ?? "",
      }
      : { ...EMPTY_MULTILANG }
  );
  const [icon, setIcon] = useState(emergency?.icon ?? "warning");
  const [color, setColor] = useState(emergency?.color ?? "#FEF2F2");
  const [severityLevelId, setSeverityLevelId] = useState<number | "">(
    emergency?.severity_level_id ?? ""
  );

  const [steps, setSteps] = useState<StepForm[]>(() => {
    if (emergency?.steps?.length) {
      return emergency.steps.map((s) => ({
        tempId: s.id,
        step_id: s.step_id,
        title: { en: s.title, si: s.title_si ?? "", ta: s.title_ta ?? "" },
        instruction: {
          en: s.instruction,
          si: s.instruction_si ?? "",
          ta: s.instruction_ta ?? "",
        },
        image_url: s.image_url ?? "",
        video_url: s.video_url ?? "",
        icon: s.icon ?? "warning",
        id: s.id,
      }));
    }
    return [{
      tempId: Date.now(),
      step_id: 1,
      title: { ...EMPTY_MULTILANG },
      instruction: { ...EMPTY_MULTILANG },
      image_url: "",
      video_url: "",
      icon: "warning",
    }];
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("severity_level").select("*");
      if (data) setSeverityLevels(data as SeverityLevel[]);
      setLoadingMeta(false);
    }
    load();
  }, []);

  function addStep() {
    setSteps((prev) => [...prev, {
      tempId: Date.now(),
      step_id: prev.length + 1,
      title: { ...EMPTY_MULTILANG },
      instruction: { ...EMPTY_MULTILANG },
      image_url: "",
      video_url: "",
      icon: "warning",
    }]);
  }

  function removeStep(tempId: number) {
    setSteps((prev) => prev.filter((s) => s.tempId !== tempId));
  }

  function updateStepMultiLang(tempId: number, field: "title" | "instruction", value: string) {
    setSteps((prev) =>
      prev.map((s) =>
        s.tempId === tempId
          ? { ...s, [field]: { ...s[field], [lang]: value } }
          : s
      )
    );
  }

  function updateStep(tempId: number, field: "image_url" | "video_url" | "icon", value: string) {
    setSteps((prev) =>
      prev.map((s) => (s.tempId === tempId ? { ...s, [field]: value } : s))
    );
  }

  function localizedLabel(value: string, si?: string | null, ta?: string | null) {
    if (lang === "si") return si || value;
    if (lang === "ta") return ta || value;
    return value;
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.en.trim()) e.name_en = "English name is required.";
    if (!severityLevelId) e.severity = "Severity level is required.";
    steps.forEach((step, i) => {
      if (!step.instruction.en.trim()) e[`step_${i}_instruction_en`] = "English instruction is required.";
      if (!step.title.en.trim()) e[`step_${i}_title_en`] = "English title is required.";
    });
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);

    const emergencyPayload = {
      name: name.en,
      name_si: name.si || null,
      name_ta: name.ta || null,
      subtitle: subtitle.en || null,
      subtitle_si: subtitle.si || null,
      subtitle_ta: subtitle.ta || null,
      warning: warning.en || null,
      warning_si: warning.si || null,
      warning_ta: warning.ta || null,
      icon,
      color,
      severity_level_id: Number(severityLevelId),
    };

    let emergencyId: number;

    if (isEdit && emergency) {
      const { error } = await supabase.from("emergency").update(emergencyPayload).eq("id", emergency.id);
      if (error) { console.error(error); setSubmitting(false); return; }
      emergencyId = emergency.id;
      await supabase.from("step").delete().eq("emergency_id", emergencyId);
    } else {
      const { data, error } = await supabase.from("emergency").insert(emergencyPayload).select("id").single();
      if (error || !data) { console.error(error); setSubmitting(false); return; }
      emergencyId = data.id;
    }

    const stepsPayload = steps.map((s, idx) => ({
      step_id: idx + 1,
      title: s.title.en,
      title_si: s.title.si || null,
      title_ta: s.title.ta || null,
      instruction: s.instruction.en,
      instruction_si: s.instruction.si || null,
      instruction_ta: s.instruction.ta || null,
      image_url: s.image_url || null,
      video_url: s.video_url || null,
      emergency_id: emergencyId,
      icon: s.icon,
    }));

    const { error: stepsError } = await supabase.from("step").insert(stepsPayload);
    if (stepsError) console.error(stepsError);

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
    <>
      <div className="px-7 py-6 flex flex-col gap-6">

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Content Language</label>
          <LanguageTabs active={lang} onChange={setLang} />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Emergency Name ({lang.toUpperCase()})
            {lang === "en" && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            type="text"
            value={name[lang]}
            onChange={(e) => setName((prev) => ({ ...prev, [lang]: e.target.value }))}
            placeholder={
              lang === "si" ? "හදිසි නාමය..." :
              lang === "ta" ? "அவசர பெயர்..." :
              "e.g. Heart Attack"
            }
            className={`border rounded-xl px-4 py-3 text-sm w-full outline-none focus:ring-2 transition-all bg-white text-gray-900 placeholder:text-gray-400 ${
              errors.name_en && lang === "en"
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-gray-200 focus:border-red-400 focus:ring-red-100"
            }`}
          />
          {errors.name_en && lang === "en" && <p className="mt-1 text-xs text-red-500">{errors.name_en}</p>}
          {lang !== "en" && <p className="mt-1 text-xs text-gray-400">English: {name.en || "—"}</p>}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Subtitle ({lang.toUpperCase()})</label>
          <input
            type="text"
            value={subtitle[lang]}
            onChange={(e) => setSubtitle((prev) => ({ ...prev, [lang]: e.target.value }))}
            placeholder={
              lang === "si" ? "උපශීර්ෂය..." :
              lang === "ta" ? "உட்தலைப்பு..." :
              "Short description..."
            }
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-white text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Icon</label>
          <div className="grid grid-cols-6 gap-2">
            {POPULAR_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                title={ic}
                className={`aspect-square flex items-center justify-center rounded-xl border-2 transition-all ${
                  icon === ic
                    ? "border-red-400 bg-red-50 text-red-500"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                <Icon name={ic} size={20} />
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Or type icon name (e.g. heart, fire)..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-white text-gray-900 placeholder:text-gray-400"
            />
            <div className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
              <Icon name={icon} size={18} />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Background Color</label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-9 h-9 rounded-lg border-2 transition-all ${
                  color === c ? "border-gray-600 scale-110" : "border-gray-200"
                }`}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Severity Level <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {severityLevels.map((sl) => (
              <button
                key={sl.id}
                type="button"
                onClick={() => setSeverityLevelId(sl.id)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold border-2 transition-all ${
                  severityLevelId === sl.id
                    ? "border-red-400 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {localizedLabel(sl.level, sl.level_si, sl.level_ta)}
              </button>
            ))}
          </div>
          {errors.severity && <p className="mt-1 text-xs text-red-500">{errors.severity}</p>}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Warning Message ({lang.toUpperCase()})
          </label>
          <textarea
            value={warning[lang]}
            onChange={(e) => setWarning((prev) => ({ ...prev, [lang]: e.target.value }))}
            rows={3}
            placeholder={
              lang === "si" ? "අනතුරු ඇඟවීම..." :
              lang === "ta" ? "எச்சரிக்கை..." :
              "Call emergency services immediately."
            }
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none bg-white text-gray-900 placeholder:text-gray-400"
          />
          {lang !== "en" && <p className="mt-1 text-xs text-gray-400">English: {warning.en || "—"}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">Step-by-Step Instructions</label>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600"
            >
              <MdAdd size={18} /> Add Step
            </button>
          </div>

          {steps.map((step, index) => (
            <div key={step.tempId} className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Step {index + 1}</span>
                </div>
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(step.tempId)}
                    className="text-gray-300 hover:text-red-400"
                  >
                    <MdDelete size={18} />
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  Title ({lang.toUpperCase()})
                  {lang === "en" && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <input
                  type="text"
                  placeholder={
                    lang === "si" ? "පියවරේ මාතෘකාව..." :
                    lang === "ta" ? "படியின் தலைப்பு..." :
                    "Step title..."
                  }
                  value={step.title[lang]}
                  onChange={(e) => updateStepMultiLang(step.tempId, "title", e.target.value)}
                  className={`border rounded-xl px-4 py-2.5 text-sm w-full outline-none focus:ring-2 bg-white text-gray-900 placeholder:text-gray-400 ${
                    errors[`step_${index}_title_en`] && lang === "en"
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-red-400 focus:ring-red-100"
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  Instruction ({lang.toUpperCase()})
                  {lang === "en" && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    lang === "si" ? "උපදෙස් ඇතුළත් කරන්න..." :
                    lang === "ta" ? "வழிமுறைகளை உள்ளிடுக..." :
                    "Step instruction..."
                  }
                  value={step.instruction[lang]}
                  onChange={(e) => updateStepMultiLang(step.tempId, "instruction", e.target.value)}
                  className={`border rounded-xl px-4 py-2.5 text-sm w-full outline-none focus:ring-2 resize-none bg-white text-gray-900 placeholder:text-gray-400 ${
                    errors[`step_${index}_instruction_en`] && lang === "en"
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-red-400 focus:ring-red-100"
                  }`}
                />
                {errors[`step_${index}_instruction_en`] && lang === "en" && (
                  <p className="mt-1 text-xs text-red-500">{errors[`step_${index}_instruction_en`]}</p>
                )}
                {lang !== "en" && (
                  <p className="mt-1 text-xs text-gray-400">English: {step.instruction.en || "—"}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Step Icon</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="warning"
                      value={step.icon}
                      onChange={(e) => updateStep(step.tempId, "icon", e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-white text-gray-900 placeholder:text-gray-400"
                    />
                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                      <Icon name={step.icon} size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={step.image_url}
                  onChange={(e) => updateStep(step.tempId, "image_url", e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-full outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Video URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={step.video_url}
                  onChange={(e) => updateStep(step.tempId, "video_url", e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-full outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl shadow-md bg-red-500 hover:bg-red-600 disabled:bg-red-300 flex items-center gap-2"
        >
          {submitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {isEdit ? "Save Changes" : "Create Emergency"}
        </button>
      </div>
    </>
  );
}
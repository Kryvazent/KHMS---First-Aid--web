import React, { useState } from "react";
import { FaTag, FaGlobe, FaClock, FaUsers, FaHashtag, FaLink } from "react-icons/fa";
import { MdSend, MdOutlineDrafts } from "react-icons/md";
import { Icon } from "../../lib/iconMap";
import { AlertRow, Language } from "../../types";
import LanguageTabs from "../ui/LanguageTabs";

function MetaRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        {icon}
      </div>
      <div className="flex flex-1 items-center justify-between gap-2">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="text-right">{children}</div>
      </div>
    </div>
  );
}

export default function AlertView({ alert }: { alert: AlertRow }) {
  const [lang, setLang] = useState<Language>("en");
  const typeColor = alert.alert_type?.color ?? "#FEF2F2";
  const title = lang === "si" ? alert.title_si ?? alert.title : lang === "ta" ? alert.title_ta ?? alert.title : alert.title;
  const message = lang === "si" ? alert.alert_si ?? alert.alert : lang === "ta" ? alert.alert_ta ?? alert.alert : alert.alert;
  const typeLabel = lang === "si"
    ? alert.alert_type?.type_si ?? alert.alert_type?.type ?? "—"
    : lang === "ta"
      ? alert.alert_type?.type_ta ?? alert.alert_type?.type ?? "—"
      : alert.alert_type?.type ?? "—";
  const districtLabel = lang === "si"
    ? alert.district?.name_si ?? alert.district?.name ?? "All Districts"
    : lang === "ta"
      ? alert.district?.name_ta ?? alert.district?.name ?? "All Districts"
      : alert.district?.name ?? "All Districts";

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <p className="mb-1.5 text-sm font-medium text-gray-700">Content Language</p>
        <LanguageTabs active={lang} onChange={setLang} />
      </div>

      <div
        className="relative overflow-hidden rounded-xl border border-gray-100 p-5"
        style={{ backgroundColor: typeColor }}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-gray-700">
            <Icon name={alert.alert_type?.icon ?? "notifications"} size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{message}</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white px-4">
        <MetaRow icon={<FaTag size={14} />} label="Type">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-700"
            style={{ backgroundColor: typeColor }}
          >
            {typeLabel}
          </span>
        </MetaRow>

        <MetaRow icon={<FaUsers size={14} />} label="Audience">
          <span className="text-sm font-medium text-gray-700">
            {alert.audience?.audience ?? "—"}
          </span>
        </MetaRow>

        <MetaRow icon={<FaGlobe size={14} />} label="District">
          <span className="text-sm font-medium text-gray-700">
            {districtLabel}
          </span>
        </MetaRow>

        <MetaRow icon={<MdSend size={14} />} label="Status">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              alert.send ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
            }`}
          >
            {alert.send ? <MdSend size={11} /> : <MdOutlineDrafts size={11} />}
            {alert.send ? "Sent" : "Draft / Scheduled"}
          </span>
        </MetaRow>

        {alert.url && (
          <MetaRow icon={<FaLink size={14} />} label="URL">
            <a
              href={alert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline max-w-50 truncate block"
            >
              {alert.url}
            </a>
          </MetaRow>
        )}

        <MetaRow icon={<FaClock size={14} />} label="Created">
          <span className="text-sm font-medium text-gray-700">
            {new Date(alert.created_at).toLocaleString()}
          </span>
        </MetaRow>

        <MetaRow icon={<FaHashtag size={14} />} label="Alert ID">
          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
            #{alert.id}
          </span>
        </MetaRow>
      </div>
    </div>
  );
}
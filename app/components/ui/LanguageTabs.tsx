"use client";

import React from "react";
import { Language } from "../../types";

type Props = {
  active: Language;
  onChange: (lang: Language) => void;
};

const LANGS: { value: Language; label: string; native: string }[] = [
  { value: "en", label: "English", native: "English" },
  { value: "si", label: "Sinhala", native: "සිංහල" },
  { value: "ta", label: "Tamil", native: "தமிழ்" },
];

export default function LanguageTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
      {LANGS.map((lang) => (
        <button
          key={lang.value}
          type="button"
          onClick={() => onChange(lang.value)}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            active === lang.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="block">{lang.native}</span>
          <span className="block text-[10px] font-normal opacity-60">{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
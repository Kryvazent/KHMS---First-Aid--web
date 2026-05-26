"use client";

import React from "react";
import { MdWarning } from "react-icons/md";
import { FaPhone } from "react-icons/fa";

type Severity = "Critical" | "Serious" | "Moderate";

type Step = {
  id: number;
  instruction: string;
  url_path?: string;
};

type Emergency = {
  id: number;
  title: string;
  severity: Severity;
  steps: Step[];
  description: string;
  tags: string[];
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

type Props = {
  emergency: Emergency;
  onClose: () => void;
};

const severityStyles: Record<Severity, string> = {
  Critical: "bg-red-100 text-red-500",
  Serious:  "bg-orange-100 text-orange-500",
  Moderate: "bg-yellow-100 text-yellow-600",
};

const fallbackSteps: Step[] = [
  { id: 1, instruction: "Call emergency services immediately" },
  { id: 2, instruction: "Place person on their back on a firm surface" },
  { id: 3, instruction: "Place heel of hand on center of chest, other hand on top" },
  { id: 4, instruction: "Push hard and fast - at least 2 inches deep, 100-120 compressions per minute" },
  { id: 5, instruction: "Give 2 rescue breaths after every 30 compressions" },
];

export default function EmergencyDetailsView({ emergency, onClose }: Props) {
  const steps = emergency.steps?.length > 0 ? emergency.steps : fallbackSteps;

  return (
    <div className="flex flex-col" style={{ maxHeight: "80vh" }}>

      <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-5">

        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 ${emergency.iconBg} rounded-2xl flex items-center justify-center ${emergency.iconColor} shrink-0`}>
            {emergency.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{emergency.title}</h2>
            <span className={`inline-block mt-1.5 text-xs font-semibold px-3 py-1 rounded-full ${severityStyles[emergency.severity]}`}>
              {emergency.severity}
            </span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3.5 flex gap-2.5">
          <MdWarning className="text-amber-400 text-lg shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            <span className="font-bold">Warning: </span>
            {emergency.description}
          </p>
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Steps to Follow:</h3>
          <div className="flex flex-col gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm shadow-red-200">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm text-gray-700 leading-relaxed">{step.instruction}</p>
                  {step.url_path && (
                    <a
                      href={step.url_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                    >
                      View resource →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-2">
          {emergency.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="shrink-0 flex gap-3 px-7 py-5 border-t border-gray-100 bg-white rounded-b-2xl">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
        >
          Close
        </button>
        <button className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-red-200 transition-all">
          <FaPhone size={13} />
          Call Emergency Services
        </button>
      </div>

    </div>
  );
}
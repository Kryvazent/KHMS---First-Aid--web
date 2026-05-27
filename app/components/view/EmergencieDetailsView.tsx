"use client";

import React from "react";
import { MdWarning } from "react-icons/md";
import { FaPhone } from "react-icons/fa";
import { EmergencyRow } from "../../types";

type Props = {
  emergency: EmergencyRow;
  onClose: () => void;
};

export default function EmergencyDetailsView({ emergency, onClose }: Props) {
  const steps = emergency.steps ?? [];
  const severityLabel = emergency.severity_level?.level ?? "Unknown";

  return (
    <div className="flex flex-col" style={{ maxHeight: "80vh" }}>
      <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: emergency.color ?? "#FEF2F2" }}
          >
            <span className="material-symbols-rounded text-3xl text-gray-700">
              {emergency.icon}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{emergency.name}</h2>
            {emergency.subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{emergency.subtitle}</p>
            )}
            <span className="inline-block mt-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
              {severityLabel}
            </span>
          </div>
        </div>

        {/* Warning */}
        {emergency.warning && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3.5 flex gap-2.5">
            <MdWarning className="text-amber-400 text-lg shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <span className="font-bold">Warning: </span>
              {emergency.warning}
            </p>
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Steps to Follow:</h3>
            <div className="flex flex-col gap-4">
              {steps
                .sort((a, b) => a.step_id - b.step_id)
                .map((step, index) => (
                  <div key={step.id} className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm shadow-red-200">
                      {step.step_id}
                    </div>
                    <div className="flex-1 pt-1">
                      {step.title && (
                        <p className="text-sm font-semibold text-gray-800 mb-0.5">{step.title}</p>
                      )}
                      <p className="text-sm text-gray-700 leading-relaxed">{step.instruction}</p>
                      <div className="flex gap-3 mt-2">
                        {step.image_url && (
                          <a href={step.image_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline">
                            View Image →
                          </a>
                        )}
                        {step.video_url && (
                          <a href={step.video_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-purple-500 hover:underline">
                            Watch Video →
                          </a>
                        )}
                      </div>
                    </div>
                    {step.icon && (
                      <span className="material-symbols-rounded text-gray-300 mt-1">
                        {step.icon}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 flex gap-3 px-7 py-5 border-t border-gray-100 bg-white rounded-b-2xl">
        <button onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          Close
        </button>
        <button className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-red-200">
          <FaPhone size={13} /> Call Emergency Services
        </button>
      </div>
    </div>
  );
}
"use client";

import { useState, KeyboardEvent } from "react";
import { MdAdd, MdDelete, MdClose } from "react-icons/md";
import { FaHeart, FaFire, FaBolt, FaBone, FaBrain, FaPills } from "react-icons/fa";
import { BsWind } from "react-icons/bs";
import { MdWarning } from "react-icons/md";
import React from "react";

type Severity = "Critical" | "Serious" | "Moderate";

type Step = {
  id: number;
  instruction: string;
  url_path: string;
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

const iconOptions = [
  { key: "heart",   icon: <FaHeart size={20} />   },
  { key: "fire",    icon: <FaFire size={20} />     },
  { key: "wind",    icon: <BsWind size={20} />     },
  { key: "bolt",    icon: <FaBolt size={20} />     },
  { key: "bone",    icon: <FaBone size={20} />     },
  { key: "warning", icon: <MdWarning size={20} />  },
  { key: "brain",   icon: <FaBrain size={20} />    },
  { key: "pills",   icon: <FaPills size={20} />    },
];

const severityOptions: { value: Severity; color: string }[] = [
  { value: "Critical", color: "bg-red-100 text-red-500"       },
  { value: "Serious",  color: "bg-orange-100 text-orange-500" },
  { value: "Moderate", color: "bg-yellow-100 text-yellow-600" },
];

type Props = {
  onClose: () => void;
  emergency?: Emergency; 
};

// Helper: guess icon key from emergency iconColor
const guessIconKey = (emergency?: Emergency): string => {
  if (!emergency) return "heart";
  if (emergency.iconColor.includes("orange")) return "fire";
  if (emergency.iconColor.includes("blue"))   return "wind";
  if (emergency.iconColor.includes("purple")) return "brain";
  if (emergency.iconColor.includes("green"))  return "pills";
  if (emergency.iconColor.includes("gray"))   return "bone";
  return "heart";
};

export default function EmergencyForm({ onClose, emergency }: Props) {
  const isEdit = !!emergency;

  const [name, setName] = useState(emergency?.title ?? "");
  const [selectedIcon, setSelectedIcon] = useState(guessIconKey(emergency));
  const [severity, setSeverity] = useState<Severity>(emergency?.severity ?? "Moderate");
  const [warningMessage, setWarningMessage] = useState(emergency?.description ?? "");
  const [steps, setSteps] = useState<Step[]>(
    emergency?.steps.length ? emergency.steps
      : [{ id: 1, instruction: "", url_path: "" }]
  );

  const [tags, setTags] = useState<string[]>(emergency?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  const addTags = (value: string) => {
    const newTags = value
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0 && !tags.includes(t));
    if (newTags.length > 0) setTags((prev) => [...prev, ...newTags]);
    setTagInput("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addTags(tagInput);
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleTagBlur = () => {
    if (tagInput.trim()) addTags(tagInput);
  };

  const removeTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  const addStep = () =>
    setSteps((prev) => [...prev, { id: Date.now(), instruction: "", url_path: "" }]);

  const removeStep = (id: number) =>
    setSteps((prev) => prev.filter((s) => s.id !== id));

  const updateStep = (id: number, field: keyof Omit<Step, "id">, value: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const handleSubmit = () => {
    onClose();
  };

  return (
    <>
      <div className="px-7 py-6 flex flex-col gap-6">

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Emergency Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Heart Attack"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
          />
        </div>

        <div className="flex gap-8">
          <div className="flex flex-col gap-3 flex-1">
            <label className="text-sm font-semibold text-gray-700">Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedIcon(opt.key)}
                  className={`w-full aspect-square flex items-center justify-center rounded-xl border-2 transition-all ${
                    selectedIcon === opt.key
                      ? "border-red-400 text-red-400 bg-red-50"
                      : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                  }`}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-40">
            <label className="text-sm font-semibold text-gray-700">Severity Level</label>
            <div className="flex flex-col gap-2.5">
              {severityOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="severity"
                    value={opt.value}
                    checked={severity === opt.value}
                    onChange={() => setSeverity(opt.value)}
                    className="accent-teal-500 w-4 h-4"
                  />
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${opt.color}`}>
                    {opt.value}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Warning Message</label>
          <textarea
            value={warningMessage}
            onChange={(e) => setWarningMessage(e.target.value)}
            rows={3}
            placeholder="Enter a warning or description..."
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Tags
            <span className="text-gray-400 font-normal ml-1.5">(separate with comma or Enter)</span>
          </label>
          <div className="flex flex-wrap gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all min-h-12">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <MdClose size={13} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => {
                if (e.target.value.includes(",")) {
                  addTags(e.target.value);
                } else {
                  setTagInput(e.target.value);
                }
              }}
              onKeyDown={handleTagKeyDown}
              onBlur={handleTagBlur}
              placeholder={tags.length === 0 ? "e.g. cardiac, life-threatening" : ""}
              className="flex-1 min-w-35 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent py-0.5"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">
              Step-by-Step Instructions
            </label>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              <MdAdd size={18} /> Add Step
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex gap-3 items-start">
                <div className="w-7 h-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-3">
                  {index + 1}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Step instruction..."
                    value={step.instruction}
                    onChange={(e) => updateStep(step.id, "instruction", e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Optional resource URL..."
                    value={step.url_path}
                    onChange={(e) => updateStep(step.id, "url_path", e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
                  />
                </div>
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors mt-3"
                  >
                    <MdDelete size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className={'px-6 py-2.5 text-white text-sm font-semibold rounded-xl shadow-md transition-all bg-red-500 hover:bg-red-600 shadow-red-200'}
        >
          {isEdit ? "Save Changes" : "Create Emergency"}
        </button>
      </div>
    </>
  );
}
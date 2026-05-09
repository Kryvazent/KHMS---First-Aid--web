"use client";

import { useState } from "react";
import { MdSearch } from "react-icons/md";
import { FaHeart, FaBolt, FaFire } from "react-icons/fa";
import { MdWarning } from "react-icons/md";

import EmergenciesCard from "../../../components/card/EmergenciesCard";
import AddEmergency from "../../..//components/form/EmergencieForm";
import Modal from "../../../components/ui/Modal";

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

const emergencies: Emergency[] = [
  {
    id: 1,
    title: "CPR",
    severity: "Critical",
    steps: [
      {
        id: 1,
        instruction: "Check if the person is responsive and breathing.",
        url_path: "/images/cpr-step-1.png",
      },
      {
        id: 2,
        instruction: "Place both hands on the center of the chest.",
        url_path: "/images/cpr-step-2.png",
      },
      {
        id: 3,
        instruction: "Push hard and fast at 100–120 compressions per minute.",
        url_path: "/images/cpr-step-3.png",
      },
    ],
    description:
      "Only perform CPR if the person is unconscious and not breathing.",
    tags: ["cardiac", "life-threatening"],
    icon: <FaHeart size={22} />,
    iconBg: "bg-red-50",
    iconColor: "text-red-400",
  },

  {
    id: 2,
    title: "Burn Injury",
    severity: "Serious",
    steps: [
      {
        id: 1,
        instruction: "Cool the burn under running water for 10 minutes.",
        url_path: "/images/burn-step-1.png",
      },
      {
        id: 2,
        instruction: "Remove tight items like rings or watches.",
        url_path: "/images/burn-step-2.png",
      },
      {
        id: 3,
        instruction: "Cover with a clean non-stick bandage.",
        url_path: "/images/burn-step-3.png",
      },
    ],
    description:
      "Do not apply ice or toothpaste directly to the burn area.",
    tags: ["fire", "skin"],
    icon: <FaFire size={22} />,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-400",
  },

  {
    id: 3,
    title: "Electric Shock",
    severity: "Critical",
    steps: [
      {
        id: 1,
        instruction: "Turn off the power source immediately.",
        url_path: "/images/electric-step-1.png",
      },
      {
        id: 2,
        instruction: "Do not touch the person until power is disconnected.",
        url_path: "/images/electric-step-2.png",
      },
      {
        id: 3,
        instruction: "Call emergency services and monitor breathing.",
        url_path: "/images/electric-step-3.png",
      },
    ],
    description:
      "Electrical injuries may cause hidden internal damage.",
    tags: ["electric", "emergency"],
    icon: <FaBolt size={22} />,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-400",
  },

  {
    id: 4,
    title: "Poisoning",
    severity: "Moderate",
    steps: [
      {
        id: 1,
        instruction: "Identify the poison if possible.",
        url_path: "/images/poison-step-1.png",
      },
      {
        id: 2,
        instruction: "Do not force vomiting unless instructed by professionals.",
        url_path: "/images/poison-step-2.png",
      },
      {
        id: 3,
        instruction: "Call poison control or emergency services.",
        url_path: "/images/poison-step-3.png",
      },
    ],
    description:
      "Keep medicines and chemicals away from children.",
    tags: ["chemical", "toxic"],
    icon: <MdWarning size={22} />,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-400",
  },
];

export default function EmergenciesPage() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All Severities");
  const [model, setModel] = useState<string | null>(null);

  const closeModel = () => setModel(null);

  const filtered = emergencies.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchSeverity =
      severityFilter === "All Severities" || e.severity === severityFilter;

    return matchSearch && matchSeverity;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Emergency Management
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Manage emergency types and first aid guides
          </p>
        </div>

        <button
          onClick={() => setModel("add")}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-md shadow-red-200 transition-all"
        >
          <span className="text-lg font-bold">+</span> Add Emergency
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3 flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-red-300 focus-within:ring-2 focus-within:ring-red-50 transition-all">
          <MdSearch className="text-gray-400 text-xl shrink-0" />

          <input
            type="text"
            placeholder="Search emergencies or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none bg-white cursor-pointer hover:border-gray-300 transition-all"
        >
          <option>All Severities</option>
          <option>Critical</option>
          <option>Serious</option>
          <option>Moderate</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <EmergenciesCard key={item.id} emergency={item} />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-400">
            <MdSearch size={40} className="mx-auto mb-3 opacity-40" />

            <p className="text-sm">
              No emergencies found matching your search.
            </p>
          </div>
        )}
      </div>
      <Modal
        isOpen={model === "add"}
        onClose={closeModel}
        title="Add New Emergency"
      >
        <AddEmergency onClose={closeModel} />
      </Modal>
    </div>
  );
}
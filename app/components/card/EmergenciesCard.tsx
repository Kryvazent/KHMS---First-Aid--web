"use client";

import React from "react";
import { MdVisibility, MdEdit, MdDelete } from "react-icons/md";
import Modal from "../ui/Modal";
import EmergencyDetailsView from "../view/EmergencieDetailsView";
import EmergencyForm from "../form/EmergencieForm";
import DeleteEmergency from "../view/DeleteEmergency";

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

type ModalType = "view-emergency" | "edit-emergency" | "delete-emergency" | null;

const severityStyles: Record<Severity, string> = {
  Critical: "bg-red-100 text-red-500",
  Serious:  "bg-orange-100 text-orange-500",
  Moderate: "bg-yellow-100 text-yellow-600",
};

export default function EmergenciesCard({ emergency }: { emergency: Emergency }) {
  const [modal, setModal] = React.useState<ModalType>(null);
  const closeModal = () => setModal(null);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 ${emergency.iconBg} rounded-2xl flex items-center justify-center ${emergency.iconColor}`}>
            {emergency.icon}
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-gray-900">{emergency.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${severityStyles[emergency.severity]}`}>
                {emergency.severity}
              </span>
              <span className="text-xs text-gray-400">{emergency.steps.length} steps</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModal("view-emergency")}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdVisibility size={20} />
          </button>
          <button
            onClick={() => setModal("edit-emergency")}
            className="p-1.5 text-blue-400 hover:text-blue-600 transition-colors"
          >
            <MdEdit size={20} />
          </button>
          <button 
            onClick={() => setModal("delete-emergency")}
            className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
          >
            <MdDelete size={20} />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4 leading-relaxed">{emergency.description}</p>

      <div className="flex flex-wrap gap-2">
        {emergency.tags.map((tag) => (
          <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <Modal isOpen={modal === "view-emergency"} onClose={closeModal} title="Emergency Details">
        <EmergencyDetailsView emergency={emergency} onClose={closeModal} />
      </Modal>

      <Modal isOpen={modal === "edit-emergency"} onClose={closeModal} title="Edit Emergency">
        <EmergencyForm
          emergency={emergency}
          onClose={closeModal}
        />
      </Modal>

      <Modal isOpen={modal === "delete-emergency"} onClose={closeModal} title="Delete Emergency">
        <DeleteEmergency id={emergency.id} title={emergency.title} onClose={closeModal} />
      </Modal>
    </div>
  );
}
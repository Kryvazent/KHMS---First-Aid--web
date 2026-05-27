"use client";

import React from "react";
import { MdVisibility, MdEdit, MdDelete } from "react-icons/md";
import Modal from "../ui/Modal";
import EmergencyDetailsView from "../view/EmergencieDetailsView";
import EmergencyForm from "../form/EmergencieForm";
import DeleteEmergency from "../view/DeleteEmergency";
import { EmergencyRow } from "../../types";

type ModalType = "view-emergency" | "edit-emergency" | "delete-emergency" | null;

export default function EmergenciesCard({
  emergency,
  onRefresh,
}: {
  emergency: EmergencyRow;
  onRefresh?: () => void;
}) {
  const [modal, setModal] = React.useState<ModalType>(null);
  const closeModal = () => setModal(null);

  const severityLabel = emergency.severity_level?.level ?? "Unknown";
  const stepCount = emergency.steps?.length ?? 0;

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
      style={{ borderLeftColor: emergency.color ?? "#e5e7eb", borderLeftWidth: 4 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: emergency.color ?? "#FEF2F2" }}
          >
            <span className="material-symbols-rounded text-2xl text-gray-600">
              {emergency.icon}
            </span>
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-gray-900">{emergency.name}</h3>
            {emergency.subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{emergency.subtitle}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {severityLabel}
              </span>
              <span className="text-xs text-gray-400">{stepCount} steps</span>
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

      {emergency.warning && (
        <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2">
          ⚠ {emergency.warning}
        </p>
      )}

      <Modal isOpen={modal === "view-emergency"} onClose={closeModal} title="Emergency Details">
        <EmergencyDetailsView emergency={emergency} onClose={closeModal} />
      </Modal>
      <Modal isOpen={modal === "edit-emergency"} onClose={closeModal} title="Edit Emergency">
        <EmergencyForm emergency={emergency} onClose={closeModal} onSuccess={onRefresh} />
      </Modal>
      <Modal isOpen={modal === "delete-emergency"} onClose={closeModal} title="Delete Emergency">
        <DeleteEmergency id={emergency.id} title={emergency.name} onClose={closeModal} onSuccess={onRefresh} />
      </Modal>
    </div>
  );
}
"use client";

import React from "react";
import Modal from "../ui/Modal";
import AlertForm from "../form/AlertForm";
import AlertView from "../view/AlertView";
import DeleteAlert from "../view/DeleteAlert";
import { FaEdit, FaEye, FaClock, FaGlobe } from "react-icons/fa";
import { MdDelete, MdSend, MdOutlineDrafts } from "react-icons/md";
import { Icon } from "../../lib/iconMap";
import { AlertRow } from "../../types";

type ModalType = "view-alert" | "edit-alert" | "delete-alert" | null;

export default function AlertCard({
  alert,
  onRefresh,
}: {
  alert: AlertRow;
  onRefresh?: () => void;
}) {
  const [modal, setModal] = React.useState<ModalType>(null);
  const closeModal = () => setModal(null);

  const typeColor = alert.alert_type?.color ?? "#FEF2F2";
  const typeLabel = alert.alert_type?.type ?? "Unknown";
  const audienceLabel = alert.audience?.audience ?? "—";
  const districtLabel = alert.district?.name ?? "All Districts";

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div
          className="absolute left-0 top-0 h-full w-1"
          style={{ backgroundColor: typeColor, filter: "brightness(0.85)" }}
        />

        <div className="flex flex-col gap-4 p-5 pl-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0" style={{ color: typeColor, filter: "brightness(0.7)" }}>
                <Icon name={alert.alert_type?.icon ?? "notifications"} size={20} />
              </span>
              <div>
                <p className="text-base font-semibold text-gray-900 leading-snug">
                  {alert.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">
                  {alert.alert}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => setModal("view-alert")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
              >
                <FaEye size={15} />
              </button>
              <button
                onClick={() => setModal("edit-alert")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-400 transition hover:bg-amber-50 hover:text-amber-600"
              >
                <FaEdit size={15} />
              </button>
              <button
                onClick={() => setModal("delete-alert")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <MdDelete size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-700"
                style={{ backgroundColor: typeColor }}
              >
                {typeLabel}
              </span>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  alert.send
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {alert.send ? <MdSend size={11} /> : <MdOutlineDrafts size={11} />}
                {alert.send ? "Sent" : "Draft"}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {audienceLabel}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <FaGlobe size={11} />
                {districtLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock size={12} />
                {new Date(alert.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={modal === "view-alert"} onClose={closeModal} title="Alert Details">
        <AlertView alert={alert} />
      </Modal>
      <Modal isOpen={modal === "edit-alert"} onClose={closeModal} title="Edit Alert">
        <AlertForm onClose={closeModal} alert={alert} onSuccess={onRefresh} />
      </Modal>
      <Modal isOpen={modal === "delete-alert"} onClose={closeModal} title="Delete Alert">
        <DeleteAlert alertId={alert.id} onClose={closeModal} onSuccess={onRefresh} />
      </Modal>
    </>
  );
}
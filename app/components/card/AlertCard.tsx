import React from "react";
import Modal from "../ui/Modal";
import AlertForm from "../form/AlertForm";
import AlertView from "../view/AlertView";
import DeleteAlert from "../view/DeleteAlert";
import { FaEdit, FaEye, FaUsers, FaClock } from "react-icons/fa";
import { MdDelete, MdOutlineErrorOutline, MdWarningAmber, MdOutlineInfo, MdOutlineCheckCircle } from "react-icons/md";

type AlertType = "Info" | "Warning" | "Critical" | "Success";
type AlertPriority = "High" | "Medium" | "Low";

export type Alert = {
  id: number;
  title: string;
  message: string;
  type: AlertType;
  priority?: AlertPriority;
  recipients?: number;
  date: string;
};

export type AlertCardProps = {
  alert: Alert;
};

const TYPE_CONFIG: Record<AlertType, { badge: string; bar: string; icon: React.ReactNode; iconColor: string }> = {
  Critical: {
    badge: "bg-red-50 text-red-700 border border-red-200",
    bar: "bg-red-500",
    icon: <MdOutlineErrorOutline size={20} />,
    iconColor: "text-red-400",
  },
  Warning: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    bar: "bg-amber-400",
    icon: <MdWarningAmber size={20} />,
    iconColor: "text-amber-400",
  },
  Info: {
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    bar: "bg-blue-400",
    icon: <MdOutlineInfo size={20} />,
    iconColor: "text-blue-400",
  },
  Success: {
    badge: "bg-green-50 text-green-700 border border-green-200",
    bar: "bg-green-500",
    icon: <MdOutlineCheckCircle size={20} />,
    iconColor: "text-green-500",
  },
};

const PRIORITY_STYLES: Record<AlertPriority, string> = {
  High: "bg-red-50 text-red-700 border border-red-200",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200",
  Low: "bg-green-50 text-green-700 border border-green-200",
};

const PRIORITY_DOT: Record<AlertPriority, string> = {
  High: "bg-red-500",
  Medium: "bg-amber-400",
  Low: "bg-green-500",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

type ModalType = "view-alert" | "edit-alert" | "delete-alert" | null;

export default function AlertCard({ alert }: AlertCardProps) {
  const [modal, setModal] = React.useState<ModalType>(null);
  const closeModal = () => setModal(null);
  const config = TYPE_CONFIG[alert.type];

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className={`absolute left-0 top-0 h-full w-1 ${config.bar}`} />

        <div className="flex flex-col gap-4 p-5 pl-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 shrink-0 ${config.iconColor}`}>
                {config.icon}
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900 leading-snug">
                  {alert.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">
                  {alert.message}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => setModal("view-alert")}
                aria-label="View alert"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
              >
                <FaEye size={15} />
              </button>
              <button
                onClick={() => setModal("edit-alert")}
                aria-label="Edit alert"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-400 transition hover:bg-amber-50 hover:text-amber-600"
              >
                <FaEdit size={15} />
              </button>
              <button
                onClick={() => setModal("delete-alert")}
                aria-label="Delete alert"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <MdDelete size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge label={alert.type} className={config.badge} />
              {alert.priority && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[alert.priority]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[alert.priority]}`} />
                  {alert.priority} Priority
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              {alert.recipients !== undefined && (
                <span className="flex items-center gap-1.5">
                  <FaUsers size={12} />
                  {alert.recipients.toLocaleString()}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <FaClock size={12} />
                {alert.date}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={modal === "view-alert"} onClose={closeModal} title="Alert Details">
        <AlertView alert={alert} />
      </Modal>
      <Modal isOpen={modal === "edit-alert"} onClose={closeModal} title="Edit Alert">
        <AlertForm onClose={closeModal} alert={alert} />
      </Modal>
      <Modal isOpen={modal === "delete-alert"} onClose={closeModal} title="Delete Alert">
        <DeleteAlert onClose={closeModal} />
      </Modal>
    </>
  );
}
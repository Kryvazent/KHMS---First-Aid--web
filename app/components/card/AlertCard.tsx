"use client";

import React from "react";
import Modal from "@/app/components/ui/Modal";
import AlertForm from "@/app/components/form/AlertForm";
import AlertView from "@/app/components/view/AlertView";
import DeleteAlert from "@/app/components/view/DeleteAlert";
import { FaEdit, FaEye, FaClock, FaGlobe } from "react-icons/fa";
import { MdDelete, MdSend, MdOutlineDrafts } from "react-icons/md";
import { Icon } from "@/app/lib/iconMap";
import { AlertRow } from "@/app/types";

type ModalType = "view-alert" | "edit-alert" | "delete-alert" | null;

export default function AlertCard({
  alert,
  onRefresh,
}: {
  alert: AlertRow;
  onRefresh?: () => void;
}) {
  const [modal, setModal] = React.useState<ModalType>(null);
  const [sending, setSending] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  const closeModal = () => setModal(null);

  const typeColor = alert.alert_type?.color ?? "#FEF2F2";
  const typeLabel = alert.alert_type?.type ?? "Unknown";
  const audienceLabel = alert.audience?.audience ?? "—";
  const districtLabel = alert.district?.name ?? "All Districts";

  // ─── Send notification handler ───
  async function handleSendNow() {
    if (sending) return;
    setSending(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert_id: alert.id }),
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({
          type: "success",
          msg: `Sent to ${data.recipients ?? data.total ?? 0} device${(data.recipients ?? 0) === 1 ? "" : "s"}`,
        });
        onRefresh?.();
      } else {
        setFeedback({
          type: "error",
          msg: data.error ?? "Failed to send notification",
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        msg: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setSending(false);
      // Auto-hide feedback after 4 seconds
      setTimeout(() => setFeedback(null), 4000);
    }
  }

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Left color bar */}
        <div
          className="absolute left-0 top-0 h-full w-1"
          style={{ backgroundColor: typeColor, filter: "brightness(0.85)" }}
        />

        <div className="flex flex-col gap-4 p-5 pl-6">
          {/* Top: icon + title + actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span
                className="mt-0.5 shrink-0"
                style={{ color: typeColor, filter: "brightness(0.7)" }}
              >
                <Icon name={alert.alert_type?.icon ?? "notifications"} size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold text-gray-900 leading-snug truncate">
                  {alert.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">
                  {alert.alert}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {/* Send Now (only for drafts) */}
              {!alert.send && (
                <button
                  onClick={handleSendNow}
                  disabled={sending}
                  title="Send notification now"
                  aria-label="Send notification"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-green-500 transition hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
                >
                  {sending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                  ) : (
                    <MdSend size={16} />
                  )}
                </button>
              )}

              {/* View */}
              <button
                onClick={() => setModal("view-alert")}
                title="View"
                aria-label="View alert"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
              >
                <FaEye size={15} />
              </button>

              {/* Edit */}
              <button
                onClick={() => setModal("edit-alert")}
                title="Edit"
                aria-label="Edit alert"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-400 transition hover:bg-amber-50 hover:text-amber-600"
              >
                <FaEdit size={15} />
              </button>

              {/* Delete */}
              <button
                onClick={() => setModal("delete-alert")}
                title="Delete"
                aria-label="Delete alert"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <MdDelete size={18} />
              </button>
            </div>
          </div>

          {/* Feedback message (after send) */}
          {feedback && (
            <div
              className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                feedback.type === "success"
                  ? "bg-green-50 border-green-100 text-green-700"
                  : "bg-red-50 border-red-100 text-red-700"
              }`}
            >
              {feedback.type === "success" ? "✓ " : "⚠ "} {feedback.msg}
            </div>
          )}

          {/* Bottom: badges + meta */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Alert type badge */}
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-700"
                style={{ backgroundColor: typeColor }}
              >
                {typeLabel}
              </span>

              {/* Send status */}
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

              {/* Audience badge */}
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {audienceLabel}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              {/* District */}
              <span className="flex items-center gap-1.5">
                <FaGlobe size={11} />
                {districtLabel}
              </span>
              {/* Date */}
              <span className="flex items-center gap-1.5">
                <FaClock size={12} />
                {new Date(alert.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
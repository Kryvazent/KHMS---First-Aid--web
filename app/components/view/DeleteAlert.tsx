"use client";

import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import { supabase } from "../../lib/supabase";

export default function DeleteAlert({
  alertId,
  onClose,
  onSuccess,
}: {
  alertId: number;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    await supabase.from("alert_draft").delete().eq("alert_id", alertId);
    await supabase.from("alert_schedule").delete().eq("alert_id", alertId);
    const { error } = await supabase.from("alert").delete().eq("id", alertId);
    setDeleting(false);
    if (error) { setError(error.message); return; }
    onSuccess?.();
    onClose();
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <MdDelete className="text-3xl text-red-500" />
      </div>
      <div>
        <h3 className="mb-1.5 text-base font-semibold text-gray-900">Delete this alert?</h3>
        <p className="text-sm leading-relaxed text-gray-500">
          This action cannot be undone. The alert will be permanently removed.
        </p>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
      <div className="flex w-full gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:bg-red-300"
        >
          {deleting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : <MdDelete size={16} />}
          {deleting ? "Deleting..." : "Delete Alert"}
        </button>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { supabase } from "../../lib/supabase";

type Props = {
  id: number;
  title?: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function DeleteEmergency({ id, title, onClose, onSuccess }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    await supabase.from("step").delete().eq("emergency_id", id);
    const { error } = await supabase.from("emergency").delete().eq("id", id);
    setDeleting(false);
    if (error) { setError(error.message); return; }
    onSuccess?.();
    onClose();
  }

  return (
    <div className="px-7 py-8 flex flex-col items-center text-center gap-5">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
        <MdDeleteOutline className="text-red-500 text-4xl" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-900">Delete Emergency</h3>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
          Are you sure you want to delete{" "}
          {title ? <span className="font-semibold text-gray-700">&quot;{title}&quot;</span> : "this emergency"}?
          All steps will also be deleted. This cannot be undone.
        </p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      <div className="flex gap-3 w-full pt-2">
        <button
          onClick={onClose}
          disabled={deleting}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-md shadow-red-200 flex items-center justify-center gap-2 disabled:bg-red-300"
        >
          {deleting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {deleting ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </div>
  );
}
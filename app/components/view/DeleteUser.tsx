"use client";

import React, { useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { supabase } from "../../lib/supabase";

type Props = {
  id: number;
  name: string;
  username: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function DeleteUser({ id, name, username, onClose, onSuccess }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const expectedConfirm = username;
  const canDelete = confirmText === expectedConfirm;

  async function handleDelete() {
    if (!canDelete) return;
    setDeleting(true);
    setError("");

    try {
      // Check if user has logs/alerts associated (foreign key safety)
      const { count: logsCount } = await supabase
        .from("log")
        .select("id", { count: "exact", head: true })
        .eq("performed_by", id);

      const { count: alertsCount } = await supabase
        .from("alert")
        .select("id", { count: "exact", head: true })
        .eq("added_by", id);

      if ((logsCount ?? 0) > 0 || (alertsCount ?? 0) > 0) {
        setError(
          `Cannot delete: this user has ${logsCount ?? 0} log(s) and ${alertsCount ?? 0} alert(s) associated. ` +
          `Remove or reassign them first.`
        );
        setDeleting(false);
        return;
      }

      const { error: delErr } = await supabase.from("user").delete().eq("id", id);
      if (delErr) throw delErr;

      // Log action
      const stored = localStorage.getItem("admin_user");
      if (stored) {
        const adminUser = JSON.parse(stored);
        await supabase.from("log").insert({
          action: `Deleted user: ${username}`,
          performed_by: adminUser.id,
        });
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete user.";
      setError(msg);
      console.error("Delete user error:", err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="px-7 py-8 flex flex-col items-center text-center gap-5">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
        <MdDeleteOutline className="text-red-500 text-4xl" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-900">Delete User Account</h3>
        <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
          You are about to permanently delete{" "}
          <span className="font-semibold text-gray-700">&quot;{name}&quot;</span>{" "}
          (<span className="font-mono text-gray-600">@{username}</span>).
          This action cannot be undone.
        </p>
      </div>

      <div className="w-full">
        <label className="block text-left text-xs font-medium text-gray-600 mb-1.5">
          Type <span className="font-mono font-semibold text-red-500">{expectedConfirm}</span> to confirm
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={expectedConfirm}
          autoComplete="off"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
        />
      </div>

      {error && (
        <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-700 text-left">
          {error}
        </div>
      )}

      <div className="flex gap-3 w-full pt-1">
        <button
          onClick={onClose}
          disabled={deleting}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting || !canDelete}
          className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-md shadow-red-200 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
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
import React, { useState } from "react";
import { MdDelete } from "react-icons/md";

export default function DeleteAlert({ onClose }: { onClose: () => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 700));
    setDeleting(false);
    onClose();
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <MdDelete className="text-3xl text-red-500" />
      </div>

      <div>
        <h3 className="mb-1.5 text-base font-semibold text-gray-900">
          Delete this alert?
        </h3>
        <p className="text-sm leading-relaxed text-gray-500">
          This action cannot be undone. The alert will be permanently removed
          and all recipients will stop receiving it.
        </p>
      </div>

      <div className="flex w-full gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:bg-red-300"
        >
          {deleting ? (
            <>
              <MdDelete className="animate-spin text-sm" aria-hidden="true" />
              Deleting...
            </>
          ) : (
            <>
              <MdDelete className="text-sm" aria-hidden="true" />
              Delete Alert
            </>
          )}
        </button>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { MdDeleteOutline } from "react-icons/md";

type Props = {
  id: number;
  title?: string;
  onClose: () => void;
  onConfirm?: (id: number) => void;
};

export default function DeleteEmergency({ id, title, onClose }: Props) {
  const handleDelete = () => {
    onClose();
  };

  return (
    <div className="px-7 py-8 flex flex-col items-center text-center gap-5">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
        <MdDeleteOutline className="text-red-500 text-4xl" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-900">Delete Emergency</h3>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
          Are you sure you want to delete{" "}
          {title ? (
            <span className="font-semibold text-gray-700">"{title}"</span>
          ) : (
            "this emergency"
          )}
          ? This action cannot be undone.
        </p>
      </div>

      <div className="flex gap-3 w-full pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-md shadow-red-200 transition-all"
        >
          Yes, Delete
        </button>
      </div>
    </div>
  );
}
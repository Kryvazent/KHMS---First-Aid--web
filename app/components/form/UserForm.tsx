"use client";

import React, { useState } from "react";
import { FiUser, FiAtSign, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { UserRow } from "../../types";

type UserFormData = {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "staff";
};

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

type Props = {
  user?: UserRow;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function UserForm({ user, onClose, onSuccess }: Props) {
  const isEdit = !!user;

  const [form, setForm] = useState<UserFormData>({
    name: user?.name ?? "",
    username: user?.username ?? "",
    password: "",
    confirmPassword: "",
    role: user?.role ?? "staff",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  function handleChange(field: keyof UserFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError("");
  }

  function validate() {
    const e: Partial<Record<keyof UserFormData, string>> = {};

    if (!form.name.trim()) e.name = "Full name is required.";
    else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters.";

    if (!form.username.trim()) e.username = "Username is required.";
    else if (form.username.trim().length < 3) e.username = "Username must be at least 3 characters.";
    else if (!/^[a-zA-Z0-9_.]+$/.test(form.username)) {
      e.username = "Only letters, numbers, dots and underscores allowed.";
    }

    // Password is required for new users, optional when editing
    if (!isEdit) {
      if (!form.password) e.password = "Password is required.";
      else if (form.password.length < 6) e.password = "Password must be at least 6 characters.";

      if (form.password !== form.confirmPassword) {
        e.confirmPassword = "Passwords do not match.";
      }
    } else if (form.password) {
      // If editing and password provided, validate it
      if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
      if (form.password !== form.confirmPassword) {
        e.confirmPassword = "Passwords do not match.";
      }
    }

    return e;
  }

  async function handleSubmit() {
    setServerError("");
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSubmitting(true);

    try {
      // Check if username already exists (when adding, or when changing username)
      if (!isEdit || form.username !== user?.username) {
        const { data: existing } = await supabase
          .from("user")
          .select("id")
          .eq("username", form.username.trim())
          .maybeSingle();

        if (existing) {
          setErrors({ username: "Username is already taken." });
          setSubmitting(false);
          return;
        }
      }

      if (isEdit && user) {
        const payload: Partial<UserRow> = {
          name: form.name.trim(),
          username: form.username.trim(),
          role: form.role,
        };
        // Only update password if filled
        if (form.password) {
          payload.password = form.password;
        }

        const { error } = await supabase
          .from("user")
          .update(payload)
          .eq("id", user.id);

        if (error) throw error;

        // Log action
        const stored = localStorage.getItem("admin_user");
        if (stored) {
          const adminUser = JSON.parse(stored);
          await supabase.from("log").insert({
            action: `Updated user: ${form.username}`,
            performed_by: adminUser.id,
          });
        }
      } else {
        const { error } = await supabase.from("user").insert({
          name: form.name.trim(),
          username: form.username.trim(),
          password: form.password,
          role: form.role,
        });

        if (error) throw error;

        // Log action
        const stored = localStorage.getItem("admin_user");
        if (stored) {
          const adminUser = JSON.parse(stored);
          await supabase.from("log").insert({
            action: `Created user: ${form.username}`,
            performed_by: adminUser.id,
          });
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save user.";
      setServerError(msg);
      console.error("User save error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 p-6">

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          ⚠ {serverError}
        </div>
      )}

      {/* Full Name */}
      <div>
        <FieldLabel label="Full Name" required />
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
          <FiUser className="text-gray-400 text-lg shrink-0" />
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. John Doe"
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
        <ErrorMsg msg={errors.name} />
      </div>

      {/* Username */}
      <div>
        <FieldLabel label="Username" required />
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
          <FiAtSign className="text-gray-400 text-lg shrink-0" />
          <input
            type="text"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            placeholder="e.g. johndoe"
            autoComplete="off"
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
        <ErrorMsg msg={errors.username} />
      </div>

      {/* Password */}
      <div>
        <FieldLabel
          label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
          required={!isEdit}
        />
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
          <FiLock className="text-gray-400 text-lg shrink-0" />
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder={isEdit ? "Leave blank to keep current" : "Min. 6 characters"}
            autoComplete="new-password"
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        <ErrorMsg msg={errors.password} />
      </div>

      {/* Confirm Password */}
      {(form.password || !isEdit) && (
        <div>
          <FieldLabel label="Confirm Password" required={!isEdit || !!form.password} />
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
            <FiLock className="text-gray-400 text-lg shrink-0" />
            <input
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="Re-enter password"
              autoComplete="new-password"
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <ErrorMsg msg={errors.confirmPassword} />
        </div>
      )}

      {/* Role */}
      <div>
        <FieldLabel label="Role" required />
        <div className="grid grid-cols-2 gap-2">
          {(["staff", "admin"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleChange("role", r)}
              className={`py-2.5 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${form.role === r
                  ? "border-red-400 bg-red-50 text-red-600"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all ${isEdit
              ? "bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300"
              : "bg-red-500 hover:bg-red-600 disabled:bg-red-300"
            }`}
        >
          {submitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {submitting
            ? (isEdit ? "Saving..." : "Creating...")
            : (isEdit ? "Save Changes" : "Create User")}
        </button>
      </div>
    </div>
  );
}
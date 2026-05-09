"use client";

import { useState } from "react";
import { FaSave } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

type PasswordField = "current" | "new" | "confirm";

type FormState = {
  current: string;
  new: string;
  confirm: string;
};

type ShowState = Record<PasswordField, boolean>;
type ErrorState = Partial<Record<PasswordField, string>>;

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-500">{msg}</p>;
}

function HintMsg({ msg }: { msg: string }) {
  return <p className="mt-1.5 text-xs text-gray-400">{msg}</p>;
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  show,
  onToggle,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  error?: string;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-gray-200 focus:border-red-400 focus:ring-red-100"
        }`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState<FormState>({
    current: "",
    new: "",
    confirm: "",
  });
  const [show, setShow] = useState<ShowState>({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<ErrorState>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function toggleShow(field: PasswordField) {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  function handleChange(field: PasswordField, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSuccess(false);
  }

  function validate(): ErrorState {
    const e: ErrorState = {};
    if (!form.current) e.current = "Current password is required.";
    if (!form.new) e.new = "New password is required.";
    else if (form.new.length < 8) e.new = "Must be at least 8 characters long.";
    if (!form.confirm) e.confirm = "Please confirm your new password.";
    else if (form.new !== form.confirm) e.confirm = "Passwords do not match.";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSuccess(true);
    setForm({ current: "", new: "", confirm: "" });
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings Management</h1>
          <p className="mt-1 text-sm text-gray-400">
            Update your account settings and change your password
          </p>
        </div>

        <div className="overflow-hidden w-100 rounded-2xl border border-gray-200 bg-white mt-8">
          <div className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <MdLockOutline size={22} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Change Password
              </h2>
            </div>

            <div className="max-w-md space-y-5">
              <div>
                <FieldLabel label="Current Password" required />
                <PasswordInput
                  value={form.current}
                  onChange={(v) => handleChange("current", v)}
                  placeholder="Enter current password"
                  show={show.current}
                  onToggle={() => toggleShow("current")}
                  error={errors.current}
                />
                <ErrorMsg msg={errors.current} />
              </div>

              <div>
                <FieldLabel label="New Password" required />
                <PasswordInput
                  value={form.new}
                  onChange={(v) => handleChange("new", v)}
                  placeholder="Enter new password"
                  show={show.new}
                  onToggle={() => toggleShow("new")}
                  error={errors.new}
                />
                {errors.new ? (
                  <ErrorMsg msg={errors.new} />
                ) : (
                  <HintMsg msg="Must be at least 8 characters long" />
                )}
              </div>

              <div>
                <FieldLabel label="Confirm New Password" required />
                <PasswordInput
                  value={form.confirm}
                  onChange={(v) => handleChange("confirm", v)}
                  placeholder="Confirm new password"
                  show={show.confirm}
                  onToggle={() => toggleShow("confirm")}
                  error={errors.confirm}
                />
                <ErrorMsg msg={errors.confirm} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            {success ? (
              <span className="text-sm font-medium text-green-600">
                ✓ Password changed successfully
              </span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:bg-red-600 disabled:bg-red-300"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave size={15} />
                  Change Password
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

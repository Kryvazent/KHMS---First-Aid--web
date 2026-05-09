import React, { useState } from "react";

type AlertType = "Info" | "Warning" | "Critical" | "Success";
type AlertPriority = "High" | "Medium" | "Low";

type AlertFormData = {
  title: string;
  message: string;
  type: AlertType;
  priority: AlertPriority | "";
  recipients: string;
  date: string;
};

type Alert = {
  id: number;
  title: string;
  message: string;
  type: AlertType;
  priority?: AlertPriority;
  recipients?: number;
  date: string;
};

const TYPE_OPTIONS: { value: AlertType; label: string; icon: string; color: string }[] = [
  { value: "Info", label: "Info", icon: "ti-info-circle", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "Warning", label: "Warning", icon: "ti-alert-triangle", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "Critical", label: "Critical", icon: "ti-alert-octagon", color: "text-red-600 bg-red-50 border-red-200" },
  { value: "Success", label: "Success", icon: "ti-circle-check", color: "text-green-600 bg-green-50 border-green-200" },
];

const PRIORITY_OPTIONS: { value: AlertPriority; label: string; color: string }[] = [
  { value: "Low", label: "Low", color: "text-green-600 bg-green-50 border-green-200" },
  { value: "Medium", label: "Medium", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "High", label: "High", color: "text-red-600 bg-red-50 border-red-200" },
];

const SELECTED_TYPE_STYLES: Record<AlertType, string> = {
  Info: "border-blue-400 bg-blue-50 text-blue-700",
  Warning: "border-amber-400 bg-amber-50 text-amber-700",
  Critical: "border-red-400 bg-red-50 text-red-700",
  Success: "border-green-400 bg-green-50 text-green-700",
};

const SELECTED_PRIORITY_STYLES: Record<AlertPriority, string> = {
  Low: "border-green-400 bg-green-50 text-green-700",
  Medium: "border-amber-400 bg-amber-50 text-amber-700",
  High: "border-red-400 bg-red-50 text-red-700",
};

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

export default function AlertForm({
  onClose,
  alert,
}: {
  onClose: () => void;
  alert?: Alert;
}) {
  const isEdit = !!alert;

  const [form, setForm] = useState<AlertFormData>({
    title: alert?.title ?? "",
    message: alert?.message ?? "",
    type: alert?.type ?? "Info",
    priority: alert?.priority ?? "",
    recipients: alert?.recipients?.toString() ?? "",
    date: alert?.date ?? new Date().toISOString().slice(0, 16),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AlertFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e: Partial<Record<keyof AlertFormData, string>> = {};
    if (!form.title.trim()) e.title = "Title is required.";
    else if (form.title.trim().length < 3) e.title = "Title must be at least 3 characters.";
    if (!form.message.trim()) e.message = "Message is required.";
    else if (form.message.trim().length < 10) e.message = "Message must be at least 10 characters.";
    if (!form.type) e.type = "Please select a type.";
    if (form.recipients && isNaN(Number(form.recipients)))
      e.recipients = "Must be a valid number.";
    if (!form.date) e.date = "Date is required.";
    return e;
  }

  function handleChange(field: keyof AlertFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="flex flex-col gap-5 p-8">
      <div>
        <FieldLabel label="Title" required />
        <input
          type="text"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="e.g. Heat Wave Warning"
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0 ${
            errors.title
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
          }`}
        />
        <ErrorMsg msg={errors.title} />
      </div>

      <div>
        <FieldLabel label="Message" required />
        <textarea
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder="Describe the alert in detail..."
          rows={3}
          className={`w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0 ${
            errors.message
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
          }`}
        />
        <div className="mt-1 flex items-center justify-between">
          <ErrorMsg msg={errors.message} />
          <span className="ml-auto text-xs text-gray-400">{form.message.length} chars</span>
        </div>
      </div>

      <div>
        <FieldLabel label="Type" required />
        <div className="grid grid-cols-4 gap-2">
          {TYPE_OPTIONS.map((opt) => {
            const isSelected = form.type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange("type", opt.value)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all ${
                  isSelected
                    ? SELECTED_TYPE_STYLES[opt.value] + " border-2"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <i className={`ti ${opt.icon} text-lg`} aria-hidden="true" />
                {opt.label}
              </button>
            );
          })}
        </div>
        <ErrorMsg msg={errors.type} />
      </div>

      <div>
        <FieldLabel label="Priority" />
        <div className="flex gap-2">
          {PRIORITY_OPTIONS.map((opt) => {
            const isSelected = form.priority === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  handleChange("priority", isSelected ? "" : opt.value)
                }
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? SELECTED_PRIORITY_STYLES[opt.value] + " border-2"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Recipients" />
          <div className="relative">
            <i
              className="ti ti-users absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="number"
              min={0}
              value={form.recipients}
              onChange={(e) => handleChange("recipients", e.target.value)}
              placeholder="0"
              className={`w-full rounded-lg border py-2.5 pl-8 pr-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0 ${
                errors.recipients
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
              }`}
            />
          </div>
          <ErrorMsg msg={errors.recipients} />
        </div>

        <div>
          <FieldLabel label="Date & Time" required />
          <input
            type="datetime-local"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-offset-0 ${
              errors.date
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
            }`}
          />
          <ErrorMsg msg={errors.date} />
        </div>
      </div>

      <div className="flex gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all ${
            isEdit
              ? "bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300"
              : "bg-red-500 hover:bg-red-600 disabled:bg-red-300"
          }`}
        >
          {submitting ? (
            <>
              <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
              {isEdit ? "Saving..." : "Adding..."}
            </>
          ) : (
            <>
              <i className={`ti ${isEdit ? "ti-device-floppy" : "ti-bell-plus"}`} aria-hidden="true" />
              {isEdit ? "Save Changes" : "Add Alert"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
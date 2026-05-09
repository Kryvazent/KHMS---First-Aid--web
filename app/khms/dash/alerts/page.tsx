"use client";

import { useState, useMemo } from "react";
import Modal from "../../../components/ui/Modal";
import AlertForm from "../../../components/form/AlertForm";
import AlertCard from "../../../components/card/AlertCard";

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

const ALERTS: Alert[] = [
  {
    id: 1,
    title: "Heat Wave Warning",
    message: "Extreme heat expected this weekend. Stay hydrated and avoid prolonged sun exposure.",
    type: "Critical",
    priority: "High",
    recipients: 1247,
    date: "2026-04-28 14:30",
  },
  {
    id: 2,
    title: "First Aid Tips: Burns",
    message: "Learn how to properly treat minor burns at home. Check our updated guide in the app.",
    type: "Info",
    recipients: 1200,
    date: "2026-04-25 10:00",
  },
  {
    id: 3,
    title: "Emergency Contact Update",
    message: "We've updated emergency contact numbers for your region. Review your contacts.",
    type: "Warning",
    priority: "High",
    recipients: 450,
    date: "2026-05-02 09:00",
  },
  {
    id: 4,
    title: "App Update Available",
    message: "A new version of the app is available with improved features and bug fixes. Update now.",
    type: "Success",
    date: "2026-05-01",
  },
];

export default function AlertsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AlertType | "">("");
  const [modal, setModal] = useState<string | null>(null);

  const closeModal = () => setModal(null);

  const filtered = useMemo(() => {
    return ALERTS.filter((a) => {
      const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || a.type === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 px-6">
      <div className="mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alert Management</h1>
            <p className="mt-1 text-sm text-gray-400">
              Create and manage alerts to keep users informed about important updates
            </p>
          </div>
          <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-md shadow-red-200 transition-all"
        >
          <span className="text-lg font-bold">+</span> Add Alert
        </button>
        </div>

        <div className="mb-5 flex gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-1 items-center gap-2.5">
            <i className="ti ti-search text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts..."
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AlertType | "")}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400"
          >
            <option value="">All Types</option>
            <option value="Critical">Critical</option>
            <option value="Warning">Warning</option>
            <option value="Info">Info</option>
            <option value="Success">Success</option>
          </select>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
            <i className="ti ti-bell-off mx-auto mb-3 text-4xl text-gray-300" aria-hidden="true" />
            <p className="text-sm text-gray-400">No alerts match your search.</p>
          </div>
        )}
      </div>

      <Modal isOpen={modal === "add"} onClose={closeModal} title="Add New Emergency">
        <AlertForm onClose={closeModal} />
      </Modal>
    </div>
  );
}
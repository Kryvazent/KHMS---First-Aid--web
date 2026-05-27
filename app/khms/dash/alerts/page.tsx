"use client";

import AlertCard from "@/app/components/card/AlertCard";
import AlertForm from "@/app/components/form/AlertForm";
import Modal from "@/app/components/ui/Modal";
import { supabase } from "@/app/lib/supabase";
import { AlertRow } from "@/app/types";
import { useState, useEffect, useCallback } from "react";

import { MdSearch } from "react-icons/md";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<number | "">("");
  const [modal, setModal] = useState<string | null>(null);
  const [alertTypes, setAlertTypes] = useState<{ id: number; type: string }[]>([]);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    const query = supabase
      .from("alert")
      .select(`*, alert_type(*), audience(*), district(*)`)
      .order("created_at", { ascending: false });

    if (typeFilter) query.eq("alert_type_id", typeFilter);

    const { data, error } = await query;
    if (!error && data) setAlerts(data as AlertRow[]);
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  useEffect(() => {
    supabase.from("alert_type").select("id,type").then(({ data }) => {
      if (data) setAlertTypes(data);
    });
  }, []);

  const filtered = alerts.filter((a) =>
    !search || a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 px-6">
      <div className="mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alert Management</h1>
            <p className="mt-1 text-sm text-gray-400">
              Create and manage alerts to keep users informed
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
            <MdSearch className="text-gray-400 text-xl" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts..."
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value ? Number(e.target.value) : "")}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none"
          >
            <option value="">All Types</option>
            {alertTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.type}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onRefresh={loadAlerts} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
            <p className="text-sm text-gray-400">No alerts found.</p>
          </div>
        )}
      </div>

      <Modal isOpen={modal === "add"} onClose={() => setModal(null)} title="Add New Alert">
        <AlertForm onClose={() => setModal(null)} onSuccess={loadAlerts} />
      </Modal>
    </div>
  );
}
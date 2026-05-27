"use client";

import EmergenciesCard from "@/app/components/card/EmergenciesCard";
import EmergencyForm from "@/app/components/form/EmergencieForm";
import Modal from "@/app/components/ui/Modal";
import { supabase } from "@/app/lib/supabase";
import { EmergencyRow } from "@/app/types";
import { useState, useEffect, useCallback } from "react";
import { MdSearch } from "react-icons/md";


export default function EmergenciesPage() {
  const [emergencies, setEmergencies] = useState<EmergencyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<number | "">("");
  const [modal, setModal] = useState<string | null>(null);
  const [severityLevels, setSeverityLevels] = useState<{ id: number; level: string }[]>([]);

  const loadEmergencies = useCallback(async () => {
    setLoading(true);
    const query = supabase
      .from("emergency")
      .select(`
        *,
        severity_level(*),
        steps:step(*)
      `)
      .order("created_at", { ascending: false });

    if (severityFilter) query.eq("severity_level_id", severityFilter);

    const { data, error } = await query;
    if (!error && data) setEmergencies(data as EmergencyRow[]);
    setLoading(false);
  }, [severityFilter]);

  useEffect(() => { loadEmergencies(); }, [loadEmergencies]);

  useEffect(() => {
    supabase.from("severity_level").select("*").then(({ data }) => {
      if (data) setSeverityLevels(data);
    });
  }, []);

  const filtered = emergencies.filter((e) =>
    !search ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.subtitle ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage emergency types and first aid guides</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-md shadow-red-200 transition-all"
        >
          <span className="text-lg font-bold">+</span> Add Emergency
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3 flex-1 border border-gray-200 rounded-xl px-4 py-2.5">
          <MdSearch className="text-gray-400 text-xl shrink-0" />
          <input
            type="text"
            placeholder="Search emergencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value ? Number(e.target.value) : "")}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none bg-white"
        >
          <option value="">All Severities</option>
          {severityLevels.map((sl) => (
            <option key={sl.id} value={sl.id}>{sl.level}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <EmergenciesCard key={item.id} emergency={item} onRefresh={loadEmergencies} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16 text-gray-400">
              <MdSearch size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No emergencies found.</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modal === "add"} onClose={() => setModal(null)} title="Add New Emergency">
        <EmergencyForm onClose={() => setModal(null)} onSuccess={loadEmergencies} />
      </Modal>
    </div>
  );
}
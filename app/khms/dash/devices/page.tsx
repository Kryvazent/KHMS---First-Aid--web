"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MdSearch, MdPhoneAndroid, MdPhoneIphone, MdRefresh,
  MdCheckCircle, MdCancel,
} from "react-icons/md";
import { FaGlobe } from "react-icons/fa";
import { supabase } from "@/app/lib/supabase";
import { DeviceToken } from "@/app/types";

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | "android" | "ios">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");

  const loadDevices = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("device_token")
      .select("*, district:district_id(id, name)")
      .order("last_active", { ascending: false, nullsFirst: false });

    if (platformFilter !== "all") q = q.eq("platform", platformFilter);
    if (statusFilter === "active") q = q.eq("is_active", true);
    if (statusFilter === "inactive") q = q.eq("is_active", false);

    const { data, error } = await q;
    if (!error && data) setDevices(data as unknown as DeviceToken[]);
    setLoading(false);
  }, [platformFilter, statusFilter]);

  useEffect(() => { loadDevices(); }, [loadDevices]);

  const filtered = devices.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.token.toLowerCase().includes(q) ||
      (d.district?.name ?? "").toLowerCase().includes(q) ||
      d.language.toLowerCase().includes(q)
    );
  });

  // Counts
  const counts = {
    total: devices.length,
    android: devices.filter((d) => d.platform === "android").length,
    ios: devices.filter((d) => d.platform === "ios").length,
    en: devices.filter((d) => d.language === "en").length,
    si: devices.filter((d) => d.language === "si").length,
    ta: devices.filter((d) => d.language === "ta").length,
  };

  async function toggleActive(id: number, currentStatus: boolean) {
    const { error } = await supabase
      .from("device_token")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    if (!error) loadDevices();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registered Devices</h1>
          <p className="text-gray-400 text-sm mt-1">
            Mobile devices subscribed to receive push notifications
          </p>
        </div>
        <button
          onClick={loadDevices}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-3 rounded-xl"
        >
          <MdRefresh size={18} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatBox label="Total" value={counts.total} color="bg-gray-100 text-gray-700" />
        <StatBox label="Android" value={counts.android} color="bg-green-50 text-green-700" />
        <StatBox label="iOS" value={counts.ios} color="bg-blue-50 text-blue-700" />
        <StatBox label="English" value={counts.en} color="bg-purple-50 text-purple-700" />
        <StatBox label="සිංහල" value={counts.si} color="bg-amber-50 text-amber-700" />
        <StatBox label="தமிழ்" value={counts.ta} color="bg-pink-50 text-pink-700" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex flex-wrap items-center gap-3 mb-6 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-60 border border-gray-200 rounded-xl px-4 py-2.5">
          <MdSearch className="text-gray-400 text-xl shrink-0" />
          <input
            type="text"
            placeholder="Search device ID, district, language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value as "all" | "android" | "ios")}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none bg-white"
        >
          <option value="all">All Platforms</option>
          <option value="android">Android</option>
          <option value="ios">iOS</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none bg-white"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="all">All Status</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center">
          <MdPhoneAndroid size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">No devices found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {filtered.map((device) => (
            <div
              key={device.id}
              className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50"
            >
              {/* Platform icon */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  device.platform === "ios" ? "bg-blue-50" : "bg-green-50"
                }`}
              >
                {device.platform === "ios" ? (
                  <MdPhoneIphone className="text-blue-500 text-xl" />
                ) : (
                  <MdPhoneAndroid className="text-green-500 text-xl" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-mono text-gray-700 truncate">
                    {device.token.substring(0, 20)}…
                  </p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      device.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {device.is_active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                  <span className="capitalize">{device.platform}</span>
                  <span>•</span>
                  <span className="uppercase">{device.language}</span>
                  {device.district && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FaGlobe size={10} /> {device.district.name}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span>
                    Last active{" "}
                    {device.last_active
                      ? new Date(device.last_active).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleActive(device.id, device.is_active)}
                title={device.is_active ? "Deactivate" : "Activate"}
                className={`shrink-0 p-2 rounded-lg transition-colors ${
                  device.is_active
                    ? "text-green-500 hover:bg-red-50 hover:text-red-500"
                    : "text-gray-300 hover:bg-green-50 hover:text-green-500"
                }`}
              >
                {device.is_active ? (
                  <MdCheckCircle size={22} />
                ) : (
                  <MdCancel size={22} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-3 ${color}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}
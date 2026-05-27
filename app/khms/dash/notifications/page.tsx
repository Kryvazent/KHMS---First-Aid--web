"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MdSend, MdCheckCircle, MdError, MdRefresh, MdSearch,
  MdPhoneAndroid, MdTrendingUp, MdNotificationsActive,
} from "react-icons/md";
import { FaPaperPlane } from "react-icons/fa";
import Link from "next/link";
import Modal from "@/app/components/ui/Modal";
import QuickNotificationForm from "@/app/components/form/QuickNotificationForm";
import { supabase } from "@/app/lib/supabase";
import { NotificationLog } from "@/app/types";
import { Icon } from "@/app/lib/iconMap";
import { ROUTES } from "@/app/constants/routes";

export default function NotificationsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<number | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalSent: 0,
    totalRecipients: 0,
    activeDevices: 0,
    last24h: 0,
  });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notification_log")
      .select(`*, alert:alert_id(id, title, alert, send, alert_type:alert_type_id(type, color, icon))`)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) setLogs(data as unknown as NotificationLog[]);
    setLoading(false);
  }, []);

  const loadStats = useCallback(async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [totalRes, recipRes, devicesRes, recentRes] = await Promise.all([
      supabase.from("notification_log").select("id", { count: "exact", head: true }),
      supabase.from("notification_log").select("success_count"),
      supabase
        .from("device_token")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("notification_log")
        .select("id", { count: "exact", head: true })
        .gte("created_at", yesterday),
    ]);

    const totalRecipients = (recipRes.data ?? []).reduce(
      (sum, r) => sum + (r.success_count ?? 0),
      0,
    );

    setStats({
      totalSent: totalRes.count ?? 0,
      totalRecipients,
      activeDevices: devicesRes.count ?? 0,
      last24h: recentRes.count ?? 0,
    });
  }, []);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [loadLogs, loadStats]);

  async function handleResend(alertId: number, logId: number) {
    if (resendingId) return;
    setResendingId(logId);
    try {
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert_id: alertId }),
      });
      const data = await res.json();
      if (data.success) {
        await loadLogs();
        await loadStats();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setResendingId(null);
    }
  }

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const title = l.alert?.title ?? l.title ?? "Quick Notification";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Push Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">
            Send notifications and view delivery history
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              loadLogs();
              loadStats();
            }}
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-3 rounded-xl transition-all"
          >
            <MdRefresh size={18} /> Refresh
          </button>
          <button
            onClick={() => setModal("quick-send")}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-md shadow-red-200 transition-all"
          >
            <MdSend size={16} /> Send Notification
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaPaperPlane className="text-blue-400 text-xl" />}
          bg="bg-blue-50"
          label="Total Sent"
          value={stats.totalSent}
        />
        <StatCard
          icon={<MdCheckCircle className="text-green-400 text-2xl" />}
          bg="bg-green-50"
          label="Recipients"
          value={stats.totalRecipients.toLocaleString()}
        />
        <StatCard
          icon={<MdPhoneAndroid className="text-purple-400 text-2xl" />}
          bg="bg-purple-50"
          label="Active Devices"
          value={stats.activeDevices}
          link={ROUTES.DEVICES}
        />
        <StatCard
          icon={<MdTrendingUp className="text-orange-400 text-2xl" />}
          bg="bg-orange-50"
          label="Last 24 Hours"
          value={stats.last24h}
        />
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3 flex-1 border border-gray-200 rounded-xl px-4 py-2.5">
          <MdSearch className="text-gray-400 text-xl shrink-0" />
          <input
            type="text"
            placeholder="Search notification history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Logs */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center">
          <MdNotificationsActive size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">
            {search ? "No notifications match your search." : "No notifications sent yet."}
          </p>
          {!search && (
            <button
              onClick={() => setModal("quick-send")}
              className="mt-4 inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
            >
              <MdSend size={16} /> Send your first notification
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {filtered.map((log) => {
            const successRate = log.total_tokens > 0
              ? Math.round((log.success_count / log.total_tokens) * 100)
              : 0;
            const isSuccess = log.failure_count === 0 && log.total_tokens > 0;
            const typeColor = log.alert?.alert_type?.color ?? "#F3F4F6";
            const isQuick = !log.alert_id;
            const title = log.alert?.title ?? log.title ?? (isQuick ? "Quick Notification" : "Deleted alert");
            const message = log.alert?.alert ?? log.message ?? (isQuick ? "Sent from web quick notification" : "—");

            return (
              <div
                key={log.id}
                className="flex items-start gap-4 p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: typeColor }}
                >
                  <Icon
                    name={log.alert?.alert_type?.icon ?? "notifications"}
                    size={18}
                    className="text-gray-700"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {message}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {log.alert && (
                        <button
                          onClick={() => handleResend(log.alert!.id, log.id)}
                          disabled={resendingId === log.id}
                          title="Resend"
                          className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                        >
                          {resendingId === log.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                          ) : (
                            <MdRefresh size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">Sent to:</span>
                      <span className="font-semibold text-gray-700">
                        {log.total_tokens.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600">
                      <MdCheckCircle size={14} />
                      <span className="font-semibold">{log.success_count}</span>
                    </div>
                    {log.failure_count > 0 && (
                      <div className="flex items-center gap-1.5 text-red-500">
                        <MdError size={14} />
                        <span className="font-semibold">{log.failure_count}</span>
                      </div>
                    )}
                    <div className="ml-auto flex items-center gap-3">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                          isSuccess
                            ? "bg-green-50 text-green-700"
                            : successRate > 50
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {successRate}% delivered
                      </span>
                      <span className="text-gray-400">
                        {new Date(log.created_at).toLocaleString(undefined, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {log.total_tokens > 0 && (
                    <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          isSuccess ? "bg-green-400" : successRate > 50 ? "bg-amber-400" : "bg-red-400"
                        }`}
                        style={{ width: `${successRate}%` }}
                      />
                    </div>
                  )}

                  {log.error_message && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5">
                      {log.error_message}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modal === "quick-send"} onClose={() => setModal(null)} title="Send Push Notification">
        <QuickNotificationForm
          onClose={() => setModal(null)}
          onSuccess={() => {
            loadLogs();
            loadStats();
          }}
        />
      </Modal>
    </div>
  );
}

function StatCard({
  icon, bg, label, value, link,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string | number;
  link?: string;
}) {
  const content = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
  return link ? <Link href={link}>{content}</Link> : content;
}
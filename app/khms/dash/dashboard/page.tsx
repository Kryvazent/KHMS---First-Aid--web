"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MdWarning, MdInfo, MdNotifications, MdError,
} from "react-icons/md";
import { FaUsers, FaPhone } from "react-icons/fa";
import { supabase } from "@/app/lib/supabase";
import { ROUTES } from "@/app/constants/routes";
import { Icon } from "@/app/lib/iconMap";
import Modal from "@/app/components/ui/Modal";
import QuickNotificationForm from "@/app/components/form/QuickNotificationForm";

type RecentAlert = {
  id: number;
  title: string;
  created_at: string;
  send: boolean;
  alert_type: { type: string; color: string; icon: string } | null;
};

type RecentEmergency = {
  id: number;
  name: string;
  icon: string;
  color: string | null;
  created_at: string;
  severity_level: { level: string } | null;
};

type ScheduledAlert = {
  id: number;
  send_at: string;
  alert: { id: number; title: string } | null;
};

function StatCard({
  icon, label, value, loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 shadow-sm">
      {icon}
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}

function QuickActionCard({
  icon, title, description, href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
    >
      {icon}
      <div>
        <p className="text-[15px] font-bold text-gray-900">{title}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </Link>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 bg-gray-100 rounded-xl animate-pulse shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
      </div>
      <div className="h-5 w-14 bg-gray-100 rounded-full animate-pulse" />
    </div>
  );
}

export default function DashboardPage() {
  const [totalEmergencies, setTotalEmergencies] = useState(0);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [sentAlerts, setSentAlerts] = useState(0);
  const [draftAlerts, setDraftAlerts] = useState(0);
  const [scheduledAlerts, setScheduledAlerts] = useState<ScheduledAlert[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [recentEmergencies, setRecentEmergencies] = useState<RecentEmergency[]>([]);

  const [statsLoading, setStatsLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [emergenciesLoading, setEmergenciesLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  const [quickSendOpen, setQuickSendOpen] = useState(false);
  useEffect(() => {
    async function loadStats() {
      setStatsLoading(true);
      const [emergenciesRes, totalAlertsRes, sentAlertsRes, draftAlertsRes] = await Promise.all([
        supabase.from("emergency").select("id", { count: "exact", head: true }),
        supabase.from("alert").select("id", { count: "exact", head: true }),
        supabase.from("alert").select("id", { count: "exact", head: true }).eq("send", true),
        supabase.from("alert").select("id", { count: "exact", head: true }).eq("send", false),
      ]);
      setTotalEmergencies(emergenciesRes.count ?? 0);
      setTotalAlerts(totalAlertsRes.count ?? 0);
      setSentAlerts(sentAlertsRes.count ?? 0);
      setDraftAlerts(draftAlertsRes.count ?? 0);
      setStatsLoading(false);
    }
    loadStats();
  }, []);

  useEffect(() => {
    async function loadScheduled() {
      setScheduleLoading(true);
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("alert_schedule")
        .select("id, send_at, alert:alert_id(id, title)")
        .gte("send_at", now)
        .order("send_at", { ascending: true })
        .limit(5);
      if (data) setScheduledAlerts(data as unknown as ScheduledAlert[]);
      setScheduleLoading(false);
    }
    loadScheduled();
  }, []);

  useEffect(() => {
    async function loadRecentAlerts() {
      setAlertsLoading(true);
      const { data } = await supabase
        .from("alert")
        .select("id, title, created_at, send, alert_type:alert_type_id(type, color, icon)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setRecentAlerts(data as unknown as RecentAlert[]);
      setAlertsLoading(false);
    }
    loadRecentAlerts();
  }, []);

  useEffect(() => {
    async function loadRecentEmergencies() {
      setEmergenciesLoading(true);
      const { data } = await supabase
        .from("emergency")
        .select("id, name, icon, color, created_at, severity_level:severity_level_id(level)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setRecentEmergencies(data as unknown as RecentEmergency[]);
      setEmergenciesLoading(false);
    }
    loadRecentEmergencies();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {!scheduleLoading && scheduledAlerts.length > 0 && (
          <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <MdWarning className="text-orange-400 text-xl shrink-0" />
              <p className="text-sm text-gray-700 font-medium">
                {scheduledAlerts.length} scheduled alert{scheduledAlerts.length > 1 ? "s" : ""} pending
              </p>
            </div>
            <Link
              href={ROUTES.ALERTS}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap ml-4"
            >
              Review Alerts
            </Link>
          </div>
        )}

        {!statsLoading && draftAlerts > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <MdInfo className="text-blue-400 text-xl shrink-0" />
              <p className="text-sm text-gray-700 font-medium">
                You have <span className="font-semibold text-blue-600">{draftAlerts} draft alert{draftAlerts > 1 ? "s" : ""}</span>
              </p>
            </div>
            <Link
              href={ROUTES.ALERTS}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap ml-4"
            >
              View Drafts
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <MdError className="text-red-400 text-2xl" />
            </div>
          }
          label="Total Emergencies"
          value={totalEmergencies}
          loading={statsLoading}
        />
        <StatCard
          icon={
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <MdNotifications className="text-orange-400 text-2xl" />
            </div>
          }
          label="Total Alerts"
          value={totalAlerts}
          loading={statsLoading}
        />
        <StatCard
          icon={
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <FaUsers className="text-green-400 text-xl" />
            </div>
          }
          label="Sent Alerts"
          value={sentAlerts}
          loading={statsLoading}
        />
        <StatCard
          icon={
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <FaPhone className="text-blue-400 text-xl" />
            </div>
          }
          label="Draft Alerts"
          value={draftAlerts}
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-bold text-gray-900">Recent Alerts</h2>
            <Link
              href={ROUTES.ALERTS}
              className="text-xs font-semibold text-blue-500 hover:text-blue-700"
            >
              View All →
            </Link>
          </div>
          <div className="px-5 py-2">
            {alertsLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : recentAlerts.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No alerts yet.</p>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: alert.alert_type?.color ?? "#F3F4F6" }}
                  >
                    <Icon name={alert.alert_type?.icon} size={16} className="text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{alert.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(alert.created_at).toLocaleDateString(undefined, {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${alert.send
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {alert.send ? "Sent" : "Draft"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-bold text-gray-900">Recent Emergencies</h2>
            <Link
              href={ROUTES.EMERGENCIES}
              className="text-xs font-semibold text-blue-500 hover:text-blue-700"
            >
              View All →
            </Link>
          </div>
          <div className="px-5 py-2">
            {emergenciesLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : recentEmergencies.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No emergencies yet.</p>
            ) : (
              recentEmergencies.map((emergency) => (
                <div
                  key={emergency.id}
                  className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: emergency.color ?? "#FEF2F2" }}
                  >
                    <Icon name={emergency.icon} size={16} className="text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{emergency.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(emergency.created_at).toLocaleDateString(undefined, {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
                    {emergency.severity_level?.level ?? "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {(scheduleLoading || scheduledAlerts.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-bold text-gray-900">Upcoming Scheduled Alerts</h2>
            <Link
              href={ROUTES.ALERTS}
              className="text-xs font-semibold text-blue-500 hover:text-blue-700"
            >
              Manage →
            </Link>
          </div>
          <div className="px-5 py-2">
            {scheduleLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : (
              scheduledAlerts.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-50 shrink-0">
                    <MdNotifications className="text-orange-400 text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {s.alert?.title ?? "Untitled Alert"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Scheduled for{" "}
                      {new Date(s.send_at).toLocaleString(undefined, {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 shrink-0">
                    Scheduled
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={quickSendOpen}
        onClose={() => setQuickSendOpen(false)}
        title="Send Push Notification"
      >
        <QuickNotificationForm
          onClose={() => setQuickSendOpen(false)}
        />
      </Modal>

    </div>
  );
}
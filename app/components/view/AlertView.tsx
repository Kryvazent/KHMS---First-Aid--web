import React from "react";
import { FaTag, FaFlag, FaClock, FaUsers, FaHashtag } from "react-icons/fa";
import { MdOutlineInfo, MdWarningAmber, MdOutlineCheckCircle, MdOutlineErrorOutline } from "react-icons/md";

type AlertType = "Info" | "Warning" | "Critical" | "Success";
type AlertPriority = "High" | "Medium" | "Low";

type Alert = {
  id: number;
  title: string;
  message: string;
  type: AlertType;
  priority?: AlertPriority;
  recipients?: number;
  date: string;
};

const TYPE_CONFIG: Record<AlertType, {
  icon: React.ReactNode;
  badge: string;
  bar: string;
  bg: string;
  iconColor: string;
}> = {
  Critical: {
    icon: <MdOutlineErrorOutline size={24} />,
    badge: "bg-red-50 text-red-700 border border-red-200",
    bar: "bg-red-500",
    bg: "bg-red-50",
    iconColor: "text-red-500",
  },
  Warning: {
    icon: <MdWarningAmber size={24} />,
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    bar: "bg-amber-500",
    bg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  Info: {
    icon: <MdOutlineInfo size={24} />,
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    bar: "bg-blue-500",
    bg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  Success: {
    icon: <MdOutlineCheckCircle size={24} />,
    badge: "bg-green-50 text-green-700 border border-green-200",
    bar: "bg-green-500",
    bg: "bg-green-50",
    iconColor: "text-green-500",
  },
};

const PRIORITY_CONFIG: Record<AlertPriority, { badge: string; dot: string }> = {
  High: { badge: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500" },
  Medium: { badge: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500" },
  Low: { badge: "bg-green-50 text-green-700 border border-green-200", dot: "bg-green-500" },
};

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        {icon}
      </div>
      <div className="flex flex-1 items-center justify-between gap-2">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="text-right">{children}</div>
      </div>
    </div>
  );
}

export default function AlertView({ alert }: { alert: Alert }) {
  const type = TYPE_CONFIG[alert.type];
  const priority = alert.priority ? PRIORITY_CONFIG[alert.priority] : null;

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className={`relative overflow-hidden rounded-xl border border-gray-100 ${type.bg} p-5`}>
        <div className={`absolute left-0 top-0 h-full w-1 ${type.bar}`} />
        <div className="flex items-start gap-3 pl-2">
          <div className={`mt-0.5 shrink-0 ${type.iconColor}`}>
            {type.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-base font-semibold text-gray-900">{alert.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{alert.message}</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white px-4">
        <MetaRow icon={<FaTag size={14} />} label="Type">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${type.badge}`}>
            {alert.type}
          </span>
        </MetaRow>

        <MetaRow icon={<FaFlag size={14} />} label="Priority">
          {priority ? (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${priority.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
              {alert.priority}
            </span>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </MetaRow>

        <MetaRow icon={<FaClock size={14} />} label="Date & Time">
          <span className="text-sm font-medium text-gray-700">{alert.date}</span>
        </MetaRow>

        <MetaRow icon={<FaUsers size={14} />} label="Recipients">
          {alert.recipients !== undefined ? (
            <span className="text-sm font-medium text-gray-700">
              {alert.recipients.toLocaleString()}
              <span className="ml-1 text-xs text-gray-400">people</span>
            </span>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </MetaRow>

        <MetaRow icon={<FaHashtag size={14} />} label="Alert ID">
          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
            #{alert.id}
          </span>
        </MetaRow>
      </div>
    </div>
  );
}
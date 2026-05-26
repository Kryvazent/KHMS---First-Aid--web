import Link from "next/link";
import { MdWarning, MdInfo, MdTrendingUp, MdNotifications, MdPeople, MdPhone, MdError } from "react-icons/md";

const StatCard = ({ icon, label, value, badge, trend, trendLabel} : {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badge?: string;
  trend?: string;
  trendLabel?: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 shadow-sm relative">
    <div className="flex items-start justify-between">
      {icon}
      {badge && (
        <span className="text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          <MdTrendingUp className="text-green-500 text-sm" />
          <span className="text-green-500 text-sm font-semibold">{trend}</span>
          {trendLabel && (
            <span className="text-gray-400 text-xs ml-1">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  </div>
);

const QuickActionCard = ({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) => (
  <Link
    href={href}
    className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer"
  >
    {icon}
    <div>
      <p className="text-[15px] font-bold text-gray-900">{title}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </Link>
);

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <MdWarning className="text-orange-400 text-xl shrink-0" />
            <p className="text-sm text-gray-700 font-medium">
              3 scheduled alerts pending approval
            </p>
          </div>
          <Link
            href="/admin/alerts"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap ml-4"
          >
            Review Alerts
          </Link>
        </div>

        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <MdInfo className="text-blue-400 text-xl shrink-0" />
            <p className="text-sm text-gray-700 font-medium">
              Server maintenance scheduled for May 5, 2026 at 2:00 AM
            </p>
          </div>
          <Link
            href="#"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap ml-4"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <MdError className="text-red-400 text-2xl" />
            </div>
          }
          label="Total Emergencies"
          value={8}
        />
        <StatCard
          icon={
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <MdNotifications className="text-orange-400 text-2xl" />
            </div>
          }
          label="Active Alerts"
          value={4}
          badge="Critical"
        />
        <StatCard
          icon={
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <MdPeople className="text-blue-400 text-2xl" />
            </div>
          }
          label="App Users"
          value="1,247"
          trend="+12.5%"
        />
        <StatCard
          icon={
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <MdPhone className="text-green-400 text-2xl" />
            </div>
          }
          label="Emergency Calls"
          value={143}
          trend="+8.2%"
          trendLabel="Last 7 days"
        />
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionCard
            icon={
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <MdNotifications className="text-red-400 text-2xl" />
              </div>
            }
            title="Send New Alert"
            description="Create and send notifications"
            href="/admin/alerts"
          />
          <QuickActionCard
            icon={
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <MdError className="text-orange-400 text-2xl" />
              </div>
            }
            title="Add Emergency Guide"
            description="Create new emergency type"
            href="/admin/emergencies"
          />
        </div>
      </div>
    </div>
  );
}
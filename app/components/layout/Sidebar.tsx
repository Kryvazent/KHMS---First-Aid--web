"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/app/constants/routes";
import { FaHeart } from "react-icons/fa";
import {
  MdDashboard,
  MdWarning,
  MdNotifications,
  MdSettings,
  MdLogout,
  MdPeople,
  MdSend,
  MdPhoneAndroid,
} from "react-icons/md";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Dashboard",     href: ROUTES.DASHBOARD,     icon: <MdDashboard size={20} />      },
  { label: "Emergencies",   href: ROUTES.EMERGENCIES,   icon: <MdWarning size={20} />        },
  { label: "Alerts",        href: ROUTES.ALERTS,        icon: <MdNotifications size={20} /> },
  { label: "Notifications", href: ROUTES.NOTIFICATIONS, icon: <MdSend size={20} />          },
  { label: "Devices",       href: ROUTES.DEVICES,       icon: <MdPhoneAndroid size={20} />  },
  { label: "Users",         href: ROUTES.USERS,         icon: <MdPeople size={20} />        },
  { label: "Settings",      href: ROUTES.SETTINGS,      icon: <MdSettings size={20} />      },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    router.push(ROUTES.LOGIN);
  };

  return (
    <aside className="w-70 min-h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-red-200">
            <FaHeart size={18} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900 leading-tight">First Aid</p>
            <p className="text-xs text-gray-400 leading-tight">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-red-500 text-white shadow-md shadow-red-200"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className={isActive ? "text-white" : "text-gray-400"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 w-full"
        >
          <span className="text-gray-400"><MdLogout size={20} /></span>
          Logout
        </button>
        <p className="text-xs text-gray-300 px-4 mt-2">Version 1.0.0</p>
      </div>
    </aside>
  );
}
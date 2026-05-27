"use client";

import UserCard from "@/app/components/card/UserCard";
import UserForm from "@/app/components/form/UserForm";
import Modal from "@/app/components/ui/Modal";
import { supabase } from "@/app/lib/supabase";
import { UserRow } from "@/app/types";
import { useState, useEffect, useCallback } from "react";
import { MdSearch, MdPeople } from "react-icons/md";

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load users:", error);
    } else if (data) {
      setUsers(data as UserRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUserId(user.id);
      } catch {
        // ignore
      }
    }
  }, []);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage admin accounts and access to the system
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-md shadow-red-200 transition-all"
        >
          <span className="text-lg font-bold">+</span> Add User
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <MdPeople className="text-blue-400 text-2xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            {loading ? (
              <div className="h-7 w-12 bg-gray-100 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3 flex-1 border border-gray-200 rounded-xl px-4 py-2.5">
          <MdSearch className="text-gray-400 text-xl shrink-0" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              onRefresh={loadUsers}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16 text-gray-400">
              <MdPeople size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {search
                  ? "No users match your search."
                  : "No users yet. Click 'Add User' to create one."}
              </p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modal === "add"} onClose={() => setModal(null)} title="Add New User">
        <UserForm onClose={() => setModal(null)} onSuccess={loadUsers} />
      </Modal>
    </div>
  );
}
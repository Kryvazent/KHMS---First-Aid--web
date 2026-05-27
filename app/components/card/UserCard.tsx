"use client";

import React from "react";
import { FaEdit, FaUserShield } from "react-icons/fa";
import { MdDelete, MdAlternateEmail } from "react-icons/md";
import Modal from "../ui/Modal";
import UserForm from "../form/UserForm";
import DeleteUser from "../view/DeleteUser";
import { UserRow } from "../../types";

type ModalType = "edit-user" | "delete-user" | null;

export default function UserCard({
  user,
  currentUserId,
  onRefresh,
}: {
  user: UserRow;
  currentUserId?: number;
  onRefresh?: () => void;
}) {
  const [modal, setModal] = React.useState<ModalType>(null);
  const closeModal = () => setModal(null);

  const isCurrentUser = currentUserId === user.id;

  // Get user initials for avatar
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Generate a consistent color based on user id
  const colors = [
    "bg-red-100 text-red-600",
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-purple-100 text-purple-600",
    "bg-amber-100 text-amber-600",
    "bg-pink-100 text-pink-600",
    "bg-cyan-100 text-cyan-600",
    "bg-indigo-100 text-indigo-600",
  ];
  const colorClass = colors[user.id % colors.length];

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${colorClass}`}>
              {initials || "?"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-bold text-gray-900 truncate">{user.name}</h3>
                {isCurrentUser && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                    YOU
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <MdAlternateEmail className="text-gray-400 text-sm shrink-0" />
                <p className="text-xs text-gray-500 truncate">{user.username}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setModal("edit-user")}
              title="Edit user"
              className="p-1.5 text-amber-400 hover:text-amber-600 transition-colors"
            >
              <FaEdit size={16} />
            </button>
            <button
              onClick={() => setModal("delete-user")}
              title={isCurrentUser ? "Cannot delete your own account" : "Delete user"}
              disabled={isCurrentUser}
              className="p-1.5 text-red-400 hover:text-red-600 transition-colors disabled:text-gray-200 disabled:cursor-not-allowed"
            >
              <MdDelete size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
          <span className="flex items-center gap-1.5">
            <FaUserShield size={11} />
            Admin
          </span>
          <span>
            Joined {new Date(user.created_at).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <Modal isOpen={modal === "edit-user"} onClose={closeModal} title="Edit User">
        <UserForm user={user} onClose={closeModal} onSuccess={onRefresh} />
      </Modal>
      <Modal isOpen={modal === "delete-user"} onClose={closeModal} title="Delete User">
        <DeleteUser
          id={user.id}
          name={user.name}
          username={user.username}
          onClose={closeModal}
          onSuccess={onRefresh}
        />
      </Modal>
    </>
  );
}
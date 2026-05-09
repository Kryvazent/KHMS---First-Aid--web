"use client";

import { FaHeart } from "react-icons/fa";
import LoginForm from "../../../components/form/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center px-4">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center shadow-lg shadow-red-200 mb-5">
          <FaHeart className="text-white text-3xl" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          First Aid Admin
        </h1>

        <p className="text-gray-400 mt-1 text-sm">
          Sign in to access the admin portal
        </p>
      </div>

      {/* Login Form Component */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <LoginForm />
      </div>

      {/* Footer */}
      <p className="text-gray-400 text-xs mt-8">
        First Aid Admin Portal v1.0.0
      </p>
    </div>
  );
}
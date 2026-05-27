"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { ROUTES } from "../../constants/routes";
import { supabase } from "../../lib/supabase";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: dbError } = await supabase
      .from("user")
      .select("id, name, username, role")
      .eq("username", username)
      .eq("password", password)
      .single();

    setLoading(false);

    if (dbError || !data) {
      setError("Invalid username or password.");
      return;
    }

    localStorage.setItem("admin_user", JSON.stringify(data));
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Username</label>
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
          <FiUser className="text-gray-400 text-lg shrink-0" />
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Password</label>
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
          <FiLock className="text-gray-400 text-lg shrink-0" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs font-medium -mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-red-200 text-sm tracking-wide"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
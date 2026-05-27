// app/hooks/useCurrentUser.ts
"use client";

import { useState, useEffect } from "react";

type User = {
  name: string;
  role: string;
};

export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin_user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);

  return user;
}
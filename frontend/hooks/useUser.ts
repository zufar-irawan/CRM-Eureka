// hooks/useUser.ts
"use client";

import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Gagal mengambil user");
        }

        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}

"use client";
import Sidebar from "@/components/Sidebar";

import { useRouter } from "next/navigation"
import { useEffect } from "react";
import { checkAuthStatus } from "../../utils/auth";
import Swal from "sweetalert2";

export default function Home() {
  const router = useRouter()

   useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) {
          Swal.fire({
            icon: "info",
            title: "You're not logged in",
            text: "Make sure to login first!",
          });
          router.replace("/login");
        } else {
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  return null
}

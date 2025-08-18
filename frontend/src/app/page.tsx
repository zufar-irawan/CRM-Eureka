"use client";
import Sidebar from "@/components/Sidebar";

import { useRouter } from "next/navigation"
import { useEffect } from "react";
import { getToken } from "../../utils/auth";

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = getToken()

    if (!token) {
      router.replace('/login')
    } else {
      router.replace('/dashboard')
    }
  }, [router])

  return null
}

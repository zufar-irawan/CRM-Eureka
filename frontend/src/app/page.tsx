"use client";
import Sidebar from "@/components/Sidebar";

import { redirect, useRouter } from "next/navigation"
import { useEffect } from "react";

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.replace('/login')
    } else {
      router.replace('/dashboard')
    }
  }, [router])
  // redirect('/login')
}

"use client";
import Sidebar from "@/components/Sidebar";

import { redirect } from "next/navigation"

export default function Home() {
  redirect('/login')
}

"use client";
import Sidebar from "@/components/Sidebar";

import { redirect } from "next/navigation"

export default function Home() {
  redirect('/login')
  // return (
  //   <div className="flex">
  //     <Sidebar />
  //     <div className="flex-1 p-6">
  //       <h1 className="text-2xl font-bold">Dashboard</h1>
  //     </div>
  //   </div>
  // );
}

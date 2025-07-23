"use client";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        {/* Konten utama di sini */}
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
    </div>
  );
}

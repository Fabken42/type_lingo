"use client";

import { useRouter } from "next/navigation";
import { Upload, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="flex items-center gap-2">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
      >
        <LayoutDashboard size={16} />
        Dashboard
      </button>
      <button
        onClick={() => router.push("/upload")}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
      >
        <Upload size={16} />
        Upload
      </button>
    </nav>
  );
}

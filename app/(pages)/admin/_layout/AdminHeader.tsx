"use client";
import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
function AdminHeader() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  return (
    <div className="flex justify-between items-center p-2 bg-gray-100">
      <h1 className="text-xl font-bold" onClick={() => router.push("/admin")}>
        Admin Dashboard
      </h1>
      <div className="flex justify-between items-center gap-2">
        <button
          className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600"
          onClick={() => router.push("/admin/manage")}
        >
          Manage Content
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600"
          onClick={() => router.push("/admin/settings")}
        >
          Site Settings
        </button>
      </div>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

export default AdminHeader;

"use client";
import { AuthProvider } from "../../contexts/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { usePathname } from "next/navigation";
import AdminHeader from "./_layout/AdminHeader";
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AdminHeader />
        {children}
        <Toaster />
      </ProtectedRoute>
    </AuthProvider>
  );
}

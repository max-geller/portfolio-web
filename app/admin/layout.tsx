"use client";
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { usePathname } from 'next/navigation';

function AdminHeader() {
  const { logout } = useAuth();
  const pathname = usePathname();
  
  if (pathname === '/admin/login') return null;

  return (
    <div className="flex justify-between items-center p-4 bg-gray-100">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

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
      </ProtectedRoute>
    </AuthProvider>
  );
}
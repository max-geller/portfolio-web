"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  console.log('ProtectedRoute rendering');
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  console.log('ProtectedRoute state:', { user: !!user, loading, pathname });

  useEffect(() => {
    console.log('ProtectedRoute useEffect running', { loading, user: !!user, pathname });
    if (!loading && !user && pathname !== '/admin/login') {
      console.log('Redirecting to login');
      router.push('/admin/login');
    }
  }, [user, loading, router, pathname]);

  // Don't show loading state for login page
  if (loading && pathname !== '/admin/login') {
    console.log('ProtectedRoute showing loading state');
    return <div>Loading...</div>;
  }

  // Allow access to login page regardless of auth state
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Protected routes require user
  return user ? <>{children}</> : null;
}
"use client";
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('AuthProvider rendering');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', { user: !!user, userId: user?.uid });
      setUser(user);
      setLoading(false);
    });
    
    return () => {
      console.log('AuthProvider unmounting, cleaning up listener');
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful:', result.user.uid);
    return result;
  };

  const logout = async () => {
    return signOut(auth);
  };

  const contextValue = { user, loading, login, logout };
  console.log('AuthProvider context value:', { user: !!user, loading });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
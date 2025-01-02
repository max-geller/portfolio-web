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
  const initialized = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider useEffect - initialized:', initialized.current);
    if (initialized.current) return;
    initialized.current = true;
    
    if (typeof window !== 'undefined') {
      console.log('Setting up auth state listener');
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed:', { user: !!user });
        setUser(user);
        setLoading(false);
      });
      
      // Only clean up when component unmounts
      return () => {
        console.log('AuthProvider unmounting, cleaning up listener');
        unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
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
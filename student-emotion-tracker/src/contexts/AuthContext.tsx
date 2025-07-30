import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  userRole: 'student' | 'faculty' | 'admin' | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'student' | 'faculty' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'faculty' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Get role from localStorage or custom claims
    const role = localStorage.getItem(`user_role_${result.user.uid}`) as 'student' | 'faculty' | 'admin' | null;
    setUserRole(role);
  };

  const register = async (email: string, password: string, role: 'student' | 'faculty' | 'admin') => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Store role in localStorage (in production, you'd use custom claims)
    localStorage.setItem(`user_role_${result.user.uid}`, role);
    setUserRole(role);
  };

  const logout = async () => {
    await signOut(auth);
    setUserRole(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const role = localStorage.getItem(`user_role_${user.uid}`) as 'student' | 'faculty' | 'admin' | null;
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
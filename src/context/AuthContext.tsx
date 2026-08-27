import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Passenger } from '../types';
import { 
  auth, 
  signInWithGoogle, 
  signInOrRegisterWithEmail, 
  logOutFromFirebase, 
  onAuthStateChanged,
  saveUserProfileToFirestore,
  db
} from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  theme: 'light';
  currency: 'INR';
  setCurrency: (c: 'INR') => void;
  toggleTheme: () => void;
  loginWithEmailOrPhone: (identifier: string, role?: 'user' | 'admin', password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  addSavedPassenger: (passenger: Passenger) => void;
  deleteSavedPassenger: (index: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('veloxbus_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-demo-1',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '+1 (555) 234-5678',
      role: 'user',
      walletBalance: 1500.00,
      savedPassengers: [
        { name: 'Alex Johnson', age: 29, gender: 'male', seatNumber: '' },
        { name: 'Elena Vance', age: 27, gender: 'female', seatNumber: '' }
      ]
    };
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('veloxbus_token') || 'jwt-demo-token');
  const [theme] = useState<'light'>('light');
  const [currency] = useState<'INR'>('INR');
  const setCurrency = () => {};

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('veloxbus_theme', 'light');

    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            const fullUser: User = {
              id: fbUser.uid,
              name: data.name || fbUser.displayName || 'Valued Traveler',
              email: data.email || fbUser.email || '',
              phone: data.phone || '+1 (555) 234-5678',
              role: data.role || (fbUser.email === 'admin@veloxbus.com' ? 'admin' : 'user'),
              walletBalance: data.walletBalance ?? 1500.00,
              savedPassengers: data.savedPassengers || [
                { name: fbUser.displayName || 'Traveler', age: 29, gender: 'male', seatNumber: '' }
              ]
            };
            setUser(fullUser);
            localStorage.setItem('veloxbus_user', JSON.stringify(fullUser));
          } else {
            const newUser: User = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Valued Traveler',
              email: fbUser.email || '',
              phone: '+1 (555) 234-5678',
              role: fbUser.email === 'admin@veloxbus.com' ? 'admin' : 'user',
              walletBalance: 1500.00,
              savedPassengers: [
                { name: fbUser.displayName || 'Alex Johnson', age: 29, gender: 'male', seatNumber: '' }
              ]
            };
            await setDoc(userRef, {
              ...newUser,
              createdAt: new Date().toISOString()
            });
            setUser(newUser);
            localStorage.setItem('veloxbus_user', JSON.stringify(newUser));
          }
          const idToken = await fbUser.getIdToken();
          setToken(idToken);
          localStorage.setItem('veloxbus_token', idToken);
        } catch (err) {
          console.warn('Error loading user profile from Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {};

  const loginWithEmailOrPhone = async (identifier: string, role: 'user' | 'admin' = 'user', password?: string) => {
    try {
      const isEmail = identifier.includes('@');
      
      // If it's email, use Firebase Auth
      if (isEmail) {
        const res = await signInOrRegisterWithEmail(identifier, password);
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('veloxbus_user', JSON.stringify(res.user));
          return true;
        }
      }

      // Fallback or phone login via server
      const payload = isEmail ? { email: identifier, role } : { phone: identifier, role };
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('veloxbus_user', JSON.stringify(data.user));
        localStorage.setItem('veloxbus_token', data.token);
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return false;
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('veloxbus_user', JSON.stringify(res.user));
        return true;
      }

      // Server fallback if popup is blocked
      const srvRes = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'alex.google@example.com', name: 'Alex Johnson (Google)' })
      });
      const data = await srvRes.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('veloxbus_user', JSON.stringify(data.user));
        localStorage.setItem('veloxbus_token', data.token);
        return true;
      }
    } catch (err) {
      console.error('Google Auth error:', err);
    }
    return false;
  };

  const logout = async () => {
    try {
      await logOutFromFirebase();
    } catch (err) {
      console.warn('Firebase logout error:', err);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('veloxbus_user');
    localStorage.removeItem('veloxbus_token');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('veloxbus_user', JSON.stringify(updated));
    if (user.id) {
      saveUserProfileToFirestore(user.id, updated).catch(err => console.warn('Firestore update error:', err));
    }
  };

  const addSavedPassenger = (passenger: Passenger) => {
    if (!user) return;
    const updated = {
      ...user,
      savedPassengers: [...user.savedPassengers, passenger]
    };
    setUser(updated);
    localStorage.setItem('veloxbus_user', JSON.stringify(updated));
    if (user.id) {
      saveUserProfileToFirestore(user.id, updated).catch(err => console.warn('Firestore update error:', err));
    }
  };

  const deleteSavedPassenger = (index: number) => {
    if (!user) return;
    const list = [...user.savedPassengers];
    list.splice(index, 1);
    const updated = { ...user, savedPassengers: list };
    setUser(updated);
    localStorage.setItem('veloxbus_user', JSON.stringify(updated));
    if (user.id) {
      saveUserProfileToFirestore(user.id, updated).catch(err => console.warn('Firestore update error:', err));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user,
        isAdmin: user?.role === 'admin',
        theme,
        currency,
        setCurrency,
        toggleTheme,
        loginWithEmailOrPhone,
        loginWithGoogle,
        logout,
        updateProfile,
        addSavedPassenger,
        deleteSavedPassenger
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

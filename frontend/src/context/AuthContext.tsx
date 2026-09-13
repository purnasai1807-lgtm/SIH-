import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, LenderProfile, BorrowerProfile } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string, expectedRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  registerLender: (payload: any) => Promise<{ success: boolean; error?: string }>;
  registerBorrower: (payload: any) => Promise<{ success: boolean; error?: string }>;
  updateLenderProfile: (data: Partial<LenderProfile>) => Promise<boolean>;
  updateBorrowerProfile: (data: Partial<BorrowerProfile>) => Promise<boolean>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    const active = await authService.refreshSession();
    setUser(active);
  }, []);

  useEffect(() => {
    const existing = authService.getCurrentUser();
    setUser(existing);
    setIsLoading(false);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  const login = async (usernameOrEmail: string, password: string, expectedRole?: UserRole) => {
    const res = await authService.login(usernameOrEmail, password, expectedRole);
    if (res.success && res.user) {
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Invalid username or password.' };
  };

  const registerLender = async (payload: any) => {
    const res = await authService.registerLender(payload);
    if (res.success && res.user) {
      setUser(res.user);
      showToast('Account created successfully. Welcome to CodeVest!');
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Registration failed.' };
  };

  const registerBorrower = async (payload: any) => {
    const res = await authService.registerBorrower(payload);
    if (res.success && res.user) {
      setUser(res.user);
      showToast('Business account registered successfully.');
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Registration failed.' };
  };

  const updateLenderProfile = async (data: Partial<LenderProfile>): Promise<boolean> => {
    const active = user || authService.getCurrentUser();
    if (!active) return false;
    const updated = await authService.updateLenderProfile(active.id, data);
    if (updated) {
      setUser(updated);
      showToast('Lender profile updated successfully.');
      return true;
    }
    return false;
  };

  const updateBorrowerProfile = async (data: Partial<BorrowerProfile>): Promise<boolean> => {
    const active = user || authService.getCurrentUser();
    if (!active) return false;
    const updated = await authService.updateBorrowerProfile(active.id, data);
    if (updated) {
      setUser(updated);
      showToast('Business profile updated successfully.');
      return true;
    }
    return false;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    showToast('You have been signed out.');
  };

  const effectiveUser = user || authService.getCurrentUser();

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        currentUser: effectiveUser,
        role: effectiveUser?.role || null,
        isAuthenticated: !!effectiveUser,
        isLoading,
        login,
        registerLender,
        registerBorrower,
        updateLenderProfile,
        updateBorrowerProfile,
        refreshSession,
        logout,
        toastMessage,
        showToast
      }}
    >
      {children}
      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          id="global-toast-banner"
          role="status"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

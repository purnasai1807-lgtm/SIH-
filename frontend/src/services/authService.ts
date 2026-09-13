import { BorrowerProfile, LenderProfile, User, UserRole } from '../types';
import { apiRequest, clearAccessToken, getAccessToken, setAccessToken } from './apiClient';

const STORAGE_KEY_CURRENT_USER = 'codevest_session';

interface ApiUser {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
}

interface TokenResponse {
  access_token: string;
  role: UserRole;
}

interface RegistrationResponse {
  user: ApiUser;
  verification_required: boolean;
  verification_url?: string | null;
}

function mapUser(user: ApiUser): User {
  return {
    id: String(user.id),
    username: user.email,
    email: user.email,
    name: user.full_name,
    role: user.role,
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

class AuthService {
  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    return data ? JSON.parse(data) as User : null;
  }

  isAuthenticated(): boolean {
    return Boolean(getAccessToken() && this.getCurrentUser());
  }

  isUsernameTaken(_username: string): boolean {
    return false;
  }

  isEmailTaken(_email: string): boolean {
    return false;
  }

  async login(usernameOrEmail: string, password: string, expectedRole?: UserRole): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const form = new URLSearchParams({ username: usernameOrEmail.trim().toLowerCase(), password });
      const token = await apiRequest<TokenResponse>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      if (expectedRole && token.role !== expectedRole) {
        return { success: false, error: `This account is registered as a ${token.role}. Please use the ${token.role} sign-in portal.` };
      }
      setAccessToken(token.access_token);
      const user = mapUser(await apiRequest<ApiUser>('/auth/me'));
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unable to sign in.' };
    }
  }

  async registerLender(payload: { fullName: string; email: string; mobile: string; password: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.register({ full_name: payload.fullName.trim(), email: payload.email.trim().toLowerCase(), phone: payload.mobile.trim(), password: payload.password, role: 'lender' });
  }

  async registerBorrower(payload: { authorizedName: string; email: string; mobile: string; password: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.register({ full_name: payload.authorizedName.trim(), email: payload.email.trim().toLowerCase(), phone: payload.mobile.trim(), password: payload.password, role: 'borrower' });
  }

  private async register(payload: { full_name: string; email: string; phone: string; password: string; role: UserRole }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const registration = await apiRequest<RegistrationResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      if (registration.verification_required) {
        const suffix = registration.verification_url ? ` Development verification link: ${registration.verification_url}` : '';
        return { success: false, error: `Registration complete. Check ${payload.email} to verify your email before signing in.${suffix}` };
      }
      return { success: false, error: 'Registration complete. Verify your email before signing in.' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unable to register.' };
    }
  }

  async refreshSession(): Promise<User | null> {
    if (!getAccessToken()) return null;
    try {
      const user = mapUser(await apiRequest<ApiUser>('/auth/me'));
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
      return user;
    } catch {
      this.logout();
      return null;
    }
  }

  async updateLenderProfile(_userId: string, _data: Partial<LenderProfile>): Promise<User | null> {
    return this.refreshSession();
  }

  async updateBorrowerProfile(_userId: string, _data: Partial<BorrowerProfile>): Promise<User | null> {
    return this.refreshSession();
  }

  async logout(): Promise<void> {
    if (getAccessToken()) {
      try {
        await apiRequest<void>('/auth/logout', { method: 'POST' });
      } finally {
        clearAccessToken();
      }
    }
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  }
}

export const authService = new AuthService();

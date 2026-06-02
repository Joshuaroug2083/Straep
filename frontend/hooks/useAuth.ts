import { useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore, User } from '../stores/authStore';

export const useAuth = () => {
  const { accessToken, refreshToken, user, setAuth, clearAuth, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (email: string, password: string, accountType: string = 'personal') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        account_type: accountType,
      });
      return response.data.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Registration failed. Please try again.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (userId: string, code: string, channel: string = 'email') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/verify', {
        user_id: userId,
        code,
        channel,
      });
      const data = response.data.data;
      
      // Initially, we set user to null or partial user because verify doesn't return full user details.
      // After verification, we'll fetch /me to get full user/profile details.
      setAuth(data.access_token, data.refresh_token, null);
      
      // Fetch full profile and user info
      await fetchMe(data.access_token);
      return data;
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'OTP Verification failed.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      const data = response.data.data;
      setAuth(data.access_token, data.refresh_token, data.user);
      return data;
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Login failed. Invalid credentials.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (err) {
      // Even if API call fails, proceed with clear state
    } finally {
      clearAuth();
      setLoading(false);
    }
  };

  const fetchMe = async (customToken?: string) => {
    setError(null);
    try {
      const headers = customToken ? { Authorization: `Bearer ${customToken}` } : {};
      const response = await api.get('/auth/me', { headers });
      const data = response.data.data;
      const meUser: User = {
        id: data.id,
        email: data.email,
        account_type: data.account_type,
        onboarding_done: data.onboarding_done,
        plan: data.subscription?.plan || 'free',
        plan_features: data.plan_features,
      };
      updateUser(meUser);
      return meUser;
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Failed to fetch user data.';
      setError(errMsg);
      throw err;
    }
  };

  return {
    accessToken,
    refreshToken,
    user,
    loading,
    error,
    register,
    verifyOtp,
    login,
    logout,
    fetchMe,
    isAuthenticated: !!accessToken,
  };
};

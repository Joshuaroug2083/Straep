import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PlanFeatures {
  full_customisation: boolean;
  premium_templates: boolean;
  max_products: number | null;
  max_services: number | null;
  advanced_analytics: boolean;
  remove_branding: boolean;
  lead_capture: boolean;
  max_active_leads: number | null;
}

export interface User {
  id: string;
  email: string;
  account_type: 'personal' | 'business' | 'creator' | 'developer' | 'agency';
  onboarding_done: boolean;
  plan: 'free' | 'professional' | 'business';
  plan_features: PlanFeatures;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (accessToken: string, refreshToken: string, user: User | null) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  updateOnboardingStep: (onboardingDone: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, user: null }),
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
      updateOnboardingStep: (onboardingDone) =>
        set((state) => ({
          user: state.user ? { ...state.user, onboarding_done: onboardingDone } : null,
        })),
    }),
    {
      name: 'straep-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

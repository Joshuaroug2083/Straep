import { useAuthStore } from '../stores/authStore';

export const usePlan = () => {
  const user = useAuthStore((state) => state.user);

  const plan = user?.plan || 'free';
  const features = user?.plan_features || {
    full_customisation: false,
    premium_templates: false,
    max_products: 5,
    max_services: 3,
    advanced_analytics: false,
    remove_branding: false,
    lead_capture: true,
    max_active_leads: 10,
  };

  const isFree = plan === 'free';
  const isProfessional = plan === 'professional';
  const isBusiness = plan === 'business';

  return {
    plan,
    features,
    isFree,
    isProfessional,
    isBusiness,
    
    // Feature gating getters
    canCustomise: features.full_customisation,
    hasPremiumTemplates: features.premium_templates,
    maxProducts: features.max_products,
    maxServices: features.max_services,
    hasAdvancedAnalytics: features.advanced_analytics,
    removeBranding: features.remove_branding,
    hasLeadCapture: features.lead_capture,
    maxActiveLeads: features.max_active_leads,
    
    // Opportunity gating helper (opportunity post type is only for Business plan)
    isOpportunityPostingAllowed: isBusiness || plan.toLowerCase() === 'business',
  };
};

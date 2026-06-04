'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  max_products: number | null;
  max_services: number | null;
  max_active_leads: number | null;
  full_customisation: boolean;
  premium_templates: boolean;
  advanced_analytics: boolean;
  remove_branding: boolean;
}

interface Subscription {
  id: string;
  plan: Plan;
  status: string;
  billing_period: string;
  current_period_end: string;
  is_active: boolean;
}

export default function BillingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansRes, subRes] = await Promise.all([
        api.get('/api/v1/subscriptions/plans/'),
        api.get('/api/v1/subscriptions/subscriptions/')
      ]);
      
      setPlans(plansRes.data.results || plansRes.data);
      setSubscription(subRes.data.data);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string, period: 'monthly' | 'annual') => {
    try {
      const response = await api.post('/api/v1/subscriptions/subscriptions/upgrade_plan/', {
        plan_id: planId,
        billing_period: period,
        payment_method: 'stripe'
      });

      if (response.data.success && response.data.data.client_secret) {
        // Redirect to Stripe payment or show payment modal
        alert(`Payment initiated. Client Secret: ${response.data.data.client_secret}`);
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Failed to upgrade plan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing info...</p>
        </div>
      </div>
    );
  }

  const currentPlanName = subscription?.plan?.name || 'free';
  const priceKey = billingPeriod === 'monthly' ? 'price_monthly' : 'price_annual';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Billing & Plans</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and view invoices</p>
        </div>

        {/* Current Plan */}
        {subscription && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-12 border-l-4 border-blue-600">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{subscription.plan.display_name}</p>
                <p className="text-gray-600 mt-1">Status: <span className="font-semibold text-green-600">{subscription.status}</span></p>
                {subscription.current_period_end && (
                  <p className="text-gray-600 mt-1">
                    Renews on: {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-gray-900">
                  ${subscription.plan[priceKey as keyof Plan]}
                </p>
                <p className="text-gray-600">per {subscription.billing_period}</p>
              </div>
            </div>
          </div>
        )}

        {/* Billing Period Selector */}
        <div className="mb-8 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="monthly"
              checked={billingPeriod === 'monthly'}
              onChange={() => setBillingPeriod('monthly')}
              className="w-4 h-4"
            />
            <span className="text-gray-700">Monthly Billing</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="annual"
              checked={billingPeriod === 'annual'}
              onChange={() => setBillingPeriod('annual')}
              className="w-4 h-4"
            />
            <span className="text-gray-700">Annual Billing (Save 17%)</span>
          </label>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg p-8 ${
                currentPlanName === plan.name
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-600 shadow-lg'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              {currentPlanName === plan.name && (
                <div className="mb-4 inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Current Plan
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.display_name}</h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${plan[priceKey as keyof Plan]}
                </span>
                <span className="text-gray-600"> /{billingPeriod}</span>
              </div>

              <button
                onClick={() => handleUpgrade(plan.id, billingPeriod)}
                disabled={currentPlanName === plan.name}
                className={`w-full py-2 rounded-lg font-semibold transition mb-6 ${
                  currentPlanName === plan.name
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentPlanName === plan.name ? 'Current Plan' : 'Upgrade'}
              </button>

              <div className="space-y-3">
                <FeatureItem
                  included={plan.max_products !== 5 || plan.name !== 'free'}
                  label={`${plan.max_products || '∞'} Products`}
                />
                <FeatureItem
                  included={plan.max_services !== 5 || plan.name !== 'free'}
                  label={`${plan.max_services || '∞'} Services`}
                />
                <FeatureItem
                  included={plan.max_active_leads !== 10 || plan.name !== 'free'}
                  label={`${plan.max_active_leads || '∞'} Active Leads`}
                />
                <FeatureItem included={plan.full_customisation} label="Full Customization" />
                <FeatureItem included={plan.premium_templates} label="Premium Templates" />
                <FeatureItem included={plan.advanced_analytics} label="Advanced Analytics" />
                <FeatureItem included={plan.remove_branding} label="Remove Branding" />
              </div>
            </div>
          ))}
        </div>

        {/* Cancel Button */}
        {subscription && currentPlanName !== 'free' && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Subscription</h3>
            <p className="text-gray-600 mb-4">
              Your subscription will be cancelled at the end of the current billing period. You'll lose access to premium features.
            </p>
            <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-semibold transition">
              Cancel Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface FeatureItemProps {
  included: boolean;
  label: string;
}

function FeatureItem({ included, label }: FeatureItemProps) {
  return (
    <div className={`flex items-center gap-2 ${included ? 'text-gray-900' : 'text-gray-400'}`}>
      <Check className={`w-4 h-4 ${included ? 'text-green-600' : 'text-gray-300'}`} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

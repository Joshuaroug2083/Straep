import { Suspense } from 'react';
import { VerifyEmailContent } from './client';

function VerifyEmailSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12">
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-slate-800 rounded-full animate-pulse mb-2" />
          <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="glass-premium rounded-2xl p-8">
          <div className="w-12 h-12 bg-slate-800 rounded-full animate-pulse mx-auto mb-6" />
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mx-auto mb-2" />
          <div className="h-4 w-full bg-slate-800 rounded animate-pulse mx-auto mb-6" />
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

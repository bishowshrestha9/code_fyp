'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        // Decode the user data
        const userData = JSON.parse(atob(userParam));

        // Log the user in
        login(token, userData);

        // Redirect based on role
        setTimeout(() => {
          if (userData.role === 'super_admin') {
            router.push('/dashboard');
          } else if (userData.role === 'vendor') {
            router.push('/dashboard');
          } else {
            router.push('/landing');
          }
        }, 500);
      } catch (err) {
        console.error('Failed to process auth callback:', err);
        setError('Failed to process authentication');
        setTimeout(() => router.push('/login'), 2000);
      }
    } else {
      setError('Authentication failed');
      setTimeout(() => router.push('/login'), 2000);
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Authentication Failed</h1>
            <p className="text-gray-400">{error}</p>
            <p className="text-gray-500 text-sm mt-2">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#00b359]/20 border-t-[#00b359] rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold text-[#00b359] mb-2">Completing authentication...</h1>
            <p className="text-gray-400">Please wait while we log you in</p>
          </>
        )}
      </div>
    </div>
  );
}

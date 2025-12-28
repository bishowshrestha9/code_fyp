"use client";

import { useRouter } from 'next/navigation';
import LoginCard from '../../components/auth/LoginCard';

export default function LoginPage() {
  const router = useRouter();

  const handleSwitchToSignup = () => {
    router.push('/sign-up');
  };

  const handleLoginSuccess = () => {
    // Redirect to user dashboard
    router.push('/landing');
    // router.push('/');
  };

  const handleAdminLogin = () => {
    // Redirect to admin dashboard
    // router.push('/admin');
    router.push('/landing');
  };

  const handleSuperAdminLogin = () => {
    // Redirect to super admin dashboard
    // router.push('/super-admin/dashboard');
    router.push('/landing');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <LoginCard
        onSwitchToSignup={handleSwitchToSignup}
        onLoginSuccess={handleLoginSuccess}
        onAdminLogin={handleAdminLogin}
        onSuperAdminLogin={handleSuperAdminLogin}
      />
    </div>
  );
}
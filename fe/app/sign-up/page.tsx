"use client";

import { useRouter } from "next/navigation";
import { SignUpCard } from "../../components/auth/SignUpCard";

export default function SignUpPage() {
  const router = useRouter();

  const handleSwitchToLogin = () => {
    router.push("/login");
  };

  const handleSignUpSuccess = () => {
    // Redirect to user dashboard
    router.push("/landing");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <SignUpCard
        onSwitchToLogin={handleSwitchToLogin}
      />

    </div>
  );
}
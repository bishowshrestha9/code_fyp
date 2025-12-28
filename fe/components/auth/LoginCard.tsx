"use client";

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api, getDefaultHeaders } from '../../lib/api';
import Image from 'next/image';

interface LoginCardProps {
    onSwitchToSignup: () => void;
    onLoginSuccess: () => void;
    onAdminLogin: () => void;
    onSuperAdminLogin: () => void;
}

export default function LoginCard({
    onSwitchToSignup,
    onLoginSuccess,
    onAdminLogin,
    onSuperAdminLogin,
}: LoginCardProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        general?: string;
    }>({});

    const { login: authLogin } = useAuth();

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response = await fetch(api.login, {
                method: 'POST',
                headers: getDefaultHeaders(),
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({
                    general: data.message || 'Invalid email or password',
                });
                setIsLoading(false);
                return;
            }

            // Login successful - store token and user info
            if (data.access_token && data.user) {
                authLogin(data.access_token, data.user);

                // Redirect based on user role
                if (data.user.role === 'super_admin') {
                    onSuperAdminLogin();
                } else if (data.user.role === 'vendor') {
                    onAdminLogin();
                } else {
                    onLoginSuccess();
                }
            } else {
                // Fallback to old logic if role is not in response
                if (email === 'bishow1@gmail.com' && password === 'password') {
                    onSuperAdminLogin();
                } else if (email === 'bishow@gmail.com' && password === 'password') {
                    onAdminLogin();
                } else {
                    onLoginSuccess();
                }
            }
        } catch (error) {
            // Handle network errors
            setErrors({
                general: 'Network error. Please check your connection and try again.',
            });
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        if (provider === 'Google') {
            setIsLoading(true);
            try {
                // Fetch the Google OAuth URL from backend with ngrok headers
                const response = await fetch(api.googleAuth, {
                    method: 'GET',
                    headers: getDefaultHeaders(),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.url) {
                        // Redirect to Google OAuth
                        window.location.href = data.url;
                    } else {
                        setErrors({ general: 'Failed to get Google OAuth URL' });
                        setIsLoading(false);
                    }
                } else {
                    setErrors({ general: 'Failed to initiate Google login' });
                    setIsLoading(false);
                }
            } catch (error) {
                setErrors({ general: 'Network error during Google login' });
                setIsLoading(false);
            }
        } else {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                onLoginSuccess();
            }, 1000);
        }
    };

    return (
        <div className="w-full max-w-md">
            {/* Logo/Brand */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-30 h-30 rounded-2xl  mb-4 ">
                    <Image src="/image.png" alt="Pasaloo Logo" width={100} height={100} className="object-contain" />
                </div>
                <p className="text-gray-400">Welcome back! Please login to continue</p>
            </div>

            {/* Main Card */}
            <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-[#2a2a2a] shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Error Message */}
                    {errors.general && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                            <p className="text-red-500 text-sm">{errors.general}</p>
                        </div>
                    )}
                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm text-gray-300 mb-2">
                            Email Address
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#00b359] transition-colors" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border ${errors.email ? 'border-red-500' : 'border-[#2a2a2a]'
                                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00b359] focus:ring-2 focus:ring-[#00b359]/20 transition-all`}
                                placeholder="you@example.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm text-gray-300 mb-2">
                            Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#00b359] transition-colors" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full pl-12 pr-12 py-3.5 bg-[#0a0a0a] border ${errors.password ? 'border-red-500' : 'border-[#2a2a2a]'
                                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00b359] focus:ring-2 focus:ring-[#00b359]/20 transition-all`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#00b359] transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-2">{errors.password}</p>
                        )}
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-[#2a2a2a] bg-[#0a0a0a] text-[#00b359] focus:ring-[#00b359] focus:ring-2 cursor-pointer"
                            />
                            <span className="ml-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                Remember me
                            </span>
                        </label>
                        <a
                            href="#"
                            className="text-sm text-[#00b359] hover:text-[#00d466] transition-colors"
                        >
                            Forgot password?
                        </a>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#00b359] hover:bg-[#00d466] text-black py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#00b359]/20 hover:shadow-[#00b359]/40"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            <>
                                <span>Sign in</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#2a2a2a]" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-[#1a1a1a] text-gray-500">Or continue with</span>
                    </div>
                </div>

                {/* Social Login */}
                <button
                    onClick={() => handleSocialLogin('Google')}
                    className="w-full flex justify-center items-center gap-2 px-4 py-3.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white hover:border-[#00b359] hover:bg-[#0a0a0a]/50 transition-all"
                >
                    <Chrome className="w-5 h-5" />
                    <span>Google</span>
                </button>

                {/* Sign Up Link */}
                <p className="text-center text-gray-400 mt-8">
                    Don't have an account?{' '}
                    <button
                        onClick={onSwitchToSignup}
                        className="text-[#00b359] hover:text-[#00d466] transition-colors"
                    >
                        Sign up
                    </button>
                </p>
            </div>

            {/* Footer */}
            <p className="text-center text-gray-500 text-sm mt-8">
                By signing in, you agree to our{' '}
                <a href="#" className="text-gray-400 hover:text-[#00b359] transition-colors">
                    Terms
                </a>{' '}
                and{' '}
                <a href="#" className="text-gray-400 hover:text-[#00b359] transition-colors">
                    Privacy Policy
                </a>
            </p>
        </div>
    );
}

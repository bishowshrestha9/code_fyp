"use client";

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api, getDefaultHeaders } from '../../lib/api';
import Image from 'next/image';

interface SignUpCardProps {
    onSwitchToLogin: () => void;
}

export function SignUpCard({ onSwitchToLogin }: SignUpCardProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        terms?: string;
        general?: string;
    }>({});

    const { login } = useAuth();

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!agreeToTerms) {
            newErrors.terms = 'You must agree to the terms and conditions';
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
            const response = await fetch(api.register, {
                method: 'POST',
                headers: getDefaultHeaders(),
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({
                    general: data.message || 'Registration failed. Please try again.',
                });
                setIsLoading(false);
                return;
            }

            // Registration successful - store token and user info
            if (data.access_token && data.user) {
                login(data.access_token, data.user);
                // Redirect will be handled by the parent component
                window.location.href = '/';
            }
        } catch (error) {
            setErrors({
                general: 'Network error. Please check your connection and try again.',
            });
            setIsLoading(false);
        }
    };



    return (
        <div className="w-full max-w-md">
            {/* Logo/Brand */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white mb-4 shadow-lg shadow-white/20">
                    <Image src="/image.png" alt="Pasaloo Logo" width={96} height={96} className="object-contain" />
                </div>
                <h1 className="text-white mb-2">Create Account</h1>
                <p className="text-gray-400">Join Pasaloo and start your journey</p>
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

                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm text-gray-300 mb-2">
                            Full Name
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-500 group-focus-within:text-[#00b359] transition-colors" />
                            </div>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border ${errors.name ? 'border-red-500' : 'border-[#2a2a2a]'
                                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00b359] focus:ring-2 focus:ring-[#00b359]/20 transition-all`}
                                placeholder="John Doe"
                            />
                        </div>
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                        )}
                    </div>

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

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm text-gray-300 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#00b359] transition-colors" />
                            </div>
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full pl-12 pr-12 py-3.5 bg-[#0a0a0a] border ${errors.confirmPassword ? 'border-red-500' : 'border-[#2a2a2a]'
                                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00b359] focus:ring-2 focus:ring-[#00b359]/20 transition-all`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#00b359] transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Terms and Conditions */}
                    <div>
                        <label className="flex items-start cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                className="w-4 h-4 mt-0.5 rounded border-[#2a2a2a] bg-[#0a0a0a] text-[#00b359] focus:ring-[#00b359] focus:ring-2 cursor-pointer"
                            />
                            <span className="ml-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                I agree to the{' '}
                                <a href="#" className="text-[#00b359] hover:text-[#00d466]">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-[#00b359] hover:text-[#00d466]">
                                    Privacy Policy
                                </a>
                            </span>
                        </label>
                        {errors.terms && (
                            <p className="text-red-500 text-sm mt-2">{errors.terms}</p>
                        )}
                    </div>

                    {/* Signup Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#00b359] hover:bg-[#00d466] text-black py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#00b359]/20 hover:shadow-[#00b359]/40"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                <span>Creating account...</span>
                            </div>
                        ) : (
                            <>
                                <span>Create account</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center text-gray-400 mt-8">
                    Already have an account?{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="text-[#00b359] hover:text-[#00d466] transition-colors"
                    >
                        Sign in
                    </button>
                </p>
            </div>

            {/* Footer */}
            <p className="text-center text-gray-500 text-sm mt-8">
                Protected by reCAPTCHA and subject to the Pasaloo{' '}
                <a href="#" className="text-gray-400 hover:text-[#00b359] transition-colors">
                    Privacy Policy
                </a>
            </p>
        </div>
    );
}

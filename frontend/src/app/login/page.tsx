"use client"

import { useState } from "react"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

interface LoginData {
    email: string;
    password: string;
}

export default function Login() {
    const [loginData, setLoginData] = useState<LoginData>({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState<boolean>(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <main>
            <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
                {/* Left Side - Welcome Section - Hidden on mobile/tablet */}
                <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16 py-8 lg:py-10 text-white order-2 lg:order-1">
                    <div className="max-w-md mx-auto lg:max-w-none">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight text-center lg:text-left">
                            Selamat Datang di <span className="text-[#2A388A]">CRM Eureka!</span>
                        </h1>
                        <p className="text-base sm:text-lg text-slate-300 mb-6 lg:mb-8 text-center lg:text-left">
                            Kendalikan relasi pelanggan Anda secara efisien dan tumbuhkan bisnis lebih cepat.
                        </p>

                        <ul className="space-y-3 lg:space-y-4 text-slate-200 text-sm sm:text-base">
                            <li className="flex items-start gap-2 justify-center lg:justify-start">
                                <span className="text-blue-400 flex-shrink-0">✓</span>
                                <span>Pantau interaksi pelanggan secara real-time</span>
                            </li>
                            <li className="flex items-start gap-2 justify-center lg:justify-start">
                                <span className="text-blue-400 flex-shrink-0">✓</span>
                                <span>Otomatiskan proses penjualan dan follow-up</span>
                            </li>
                            <li className="flex items-start gap-2 justify-center lg:justify-start">
                                <span className="text-blue-400 flex-shrink-0">✓</span>
                                <span>Tingkatkan retensi dan loyalitas pelanggan</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="bg-slate-100 min-h-screen lg:h-screen lg:flex-1 flex flex-col order-1 lg:order-2">
                    <div className="flex flex-col items-center py-4 lg:py-5">
                        <Image
                            src="/images/logo-eureka!.png"
                            alt="Logo Eureka"
                            width={120}
                            height={120}
                            className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36"
                        />
                        {/* Mobile Welcome Text - Only show on mobile/tablet */}
                        <div className="lg:hidden mt-4 text-center px-4">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                                Selamat Datang di <span className="text-[#2A388A]">CRM Eureka!</span>
                            </h1>
                            <p className="text-base text-slate-600 mt-2">
                                Kendalikan relasi pelanggan Anda secara efisien
                            </p>
                        </div>
                    </div>

                    <div className="bg-white w-[90%] sm:w-[80%] lg:w-[70%] mx-auto rounded-t-3xl shadow-2xl px-6 sm:px-8 pt-6 sm:pt-8 pb-8 sm:pb-15 backdrop-blur-sm border border-white/20 flex-grow flex flex-col">
                        <div className="space-y-6 sm:space-y-8 max-w-md w-full pt-5">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={loginData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                                        placeholder="nama@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={loginData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                                        placeholder="Masukkan password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
                                </label>
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                    Lupa password?
                                </a>
                            </div>

                            {/* Login Button */}
                            <button
                                type="button"
                                // onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Masuk</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
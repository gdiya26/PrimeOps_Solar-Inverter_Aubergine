import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Zap, Mail, Lock, User, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Login() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (signInError) throw signInError;
                navigate('/');
            } else {
                const { error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            username: formData.username,
                            phone: formData.phone
                        }
                    }
                });
                if (signUpError) throw signUpError;
                // Auto sign-in or redirect after successful registration
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0E1117] flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#FFC107]/10 blur-[120px]" />
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#FF9800]/10 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-[#1A1D29]/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#FFC107] to-[#FF9800] rounded-xl flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-[#0E1117]" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Welcome to SolarAI</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {isLogin ? 'Sign in to access your dashboard' : 'Create an account to get started'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        placeholder="Username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full bg-[#0E1117] border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFC107] transition-colors"
                                    />
                                </div>

                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-[#0E1117] border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFC107] transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-[#0E1117] border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFC107] transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-[#0E1117] border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFC107] transition-colors"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm mt-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#FFC107] to-[#FF9800] text-[#0E1117] font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

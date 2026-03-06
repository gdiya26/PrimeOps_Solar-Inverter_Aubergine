import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setFormData(prev => ({
                    ...prev,
                    email: user.email || '',
                    username: user.user_metadata?.username || '',
                    phone: user.user_metadata?.phone || '',
                }));
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        // Clear messages when user starts typing again
        setMessage(null);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            // 1. Update user metadata (username, phone)
            const { error: metadataError } = await supabase.auth.updateUser({
                data: {
                    username: formData.username,
                    phone: formData.phone
                }
            });
            if (metadataError) throw metadataError;

            // 2. Update email if changed (this usually sends a confirmation email before applying)
            // For this hackathon scope, we might just initiate it
            const { data: { user } } = await supabase.auth.getUser();
            if (user && formData.email !== user.email) {
                const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
                if (emailError) throw emailError;
                setMessage({ type: 'success', text: 'Profile updated. A confirmation link was sent to your new email.' });
            } else {
                setMessage({ type: 'success', text: 'Profile updated successfully.' });
            }

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: formData.newPassword
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Password updated successfully.' });
            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-[#FFC107] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    My Profile
                </h1>
                <p className="text-sm text-gray-400">Manage your personal information and security</p>
            </header>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success'
                        ? 'bg-[#00E676]/10 border-[#00E676]/20 text-[#00E676]'
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm font-medium">{message.text}</p>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Details Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#1A1D29] border border-gray-800 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                        <div className="p-2 bg-[#FFC107]/10 rounded-lg">
                            <User className="w-5 h-5 text-[#FFC107]" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Personal Information</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-[#0E1117] border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#FFC107] transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#0E1117] border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#FFC107] transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-[#0E1117] border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#FFC107] transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 bg-[#1E2333] hover:bg-[#252B3D] text-white py-2.5 rounded-lg border border-gray-700 transition-colors mt-6 font-medium disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                    </form>
                </motion.div>

                {/* Security / Password Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#1A1D29] border border-gray-800 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <Lock className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Security</h2>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Leave blank to keep current"
                                    className="w-full bg-[#0E1117] border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm new password"
                                    className="w-full bg-[#0E1117] border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving || !formData.newPassword}
                            className="w-full flex items-center justify-center gap-2 bg-[#1E2333] hover:bg-[#252B3D] text-white py-2.5 rounded-lg border border-gray-700 transition-colors mt-6 font-medium disabled:opacity-50"
                        >
                            <Lock className="w-4 h-4" />
                            {saving ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

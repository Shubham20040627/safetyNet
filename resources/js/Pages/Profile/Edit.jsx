import React from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Edit({ status }) {
    const user = usePage().props.auth.user;

    // Form 1: Profile Info
    const infoForm = useForm({
        name: user.name,
        email: user.email,
    });

    // Form 2: Password Update
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Form 3: Account Deletion
    const deleteForm = useForm({
        password: '',
    });

    const submitInfo = (e) => {
        e.preventDefault();
        infoForm.patch(route('profile.update'));
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            onSuccess: () => passwordForm.reset(),
        });
    };

    const submitDelete = (e) => {
        e.preventDefault();
        if (window.confirm("Are you sure you want to permanently delete your account? This action is irreversible.")) {
            deleteForm.delete(route('profile.destroy'));
        }
    };

    return (
        <AppLayout header="Profile Settings">
            <Head title="Profile Settings" />

            <div className="max-w-4xl mx-auto space-y-8 premium-card">
                {status === 'profile-updated' && (
                    <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl text-emerald-800 font-bold text-sm">
                        Profile information updated successfully.
                    </div>
                )}

                {/* 1. Update Profile Info */}
                <div className="premium-card p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Profile Information</h3>
                    <p className="text-xs text-slate-500 mb-6">Update your account name and email address.</p>

                    <form onSubmit={submitInfo} className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={infoForm.data.name}
                                onChange={(e) => infoForm.setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm"
                                required
                            />
                            {infoForm.errors.name && <div className="text-xs text-red-600 mt-1">{infoForm.errors.name}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={infoForm.data.email}
                                onChange={(e) => infoForm.setData('email', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm"
                                required
                            />
                            {infoForm.errors.email && <div className="text-xs text-red-600 mt-1">{infoForm.errors.email}</div>}
                        </div>

                        <button
                            type="submit"
                            disabled={infoForm.processing}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition uppercase tracking-wider shadow cursor-pointer"
                        >
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* 2. Update Password */}
                <div className="premium-card p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-1">Change Password</h3>
                    <p className="text-xs text-slate-400 mb-6">Ensure your account is using a long, random password to stay secure.</p>
                    <form onSubmit={submitPassword} className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm"
                                placeholder="••••••••"
                                required
                            />
                            {passwordForm.errors.current_password && <div className="text-xs text-red-600 mt-1">{passwordForm.errors.current_password}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">New Password</label>
                            <input
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm"
                                placeholder="••••••••"
                                required
                            />
                            {passwordForm.errors.password && <div className="text-xs text-red-600 mt-1">{passwordForm.errors.password}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm"
                                placeholder="••••••••"
                                required
                            />
                            {passwordForm.errors.password_confirmation && <div className="text-xs text-red-600 mt-1">{passwordForm.errors.password_confirmation}</div>}
                        </div>

                        <button
                            type="submit"
                            disabled={passwordForm.processing}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition uppercase tracking-wider shadow cursor-pointer"
                        >
                            Update Password
                        </button>
                    </form>
                </div>

                {/* 3. Delete Account */}
                <div className="premium-card p-6 border border-red-100">
                    <h3 className="text-lg font-bold text-red-600 mb-1">Delete Account</h3>
                    <p className="text-xs text-slate-500 mb-6">Permanently delete your account and all associated safety reports.</p>

                    <form onSubmit={submitDelete} className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Password Confirmation</label>
                            <input
                                type="password"
                                value={deleteForm.data.password}
                                onChange={(e) => deleteForm.setData('password', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm"
                                placeholder="Confirm your password to proceed"
                                required
                            />
                            {deleteForm.errors.password && <div className="text-xs text-red-600 mt-1">{deleteForm.errors.password}</div>}
                        </div>

                        <button
                            type="submit"
                            disabled={deleteForm.processing}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition uppercase tracking-wider shadow cursor-pointer"
                        >
                            Delete Account Permanently
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

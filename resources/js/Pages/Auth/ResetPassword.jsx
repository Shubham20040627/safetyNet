import React from 'react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'));
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 font-serif-custom mb-3">Reset Password</h2>
                <p className="text-slate-500 text-sm">Create a new secure password for your SafetyNet account.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white text-sm"
                    />
                    {errors.email && <div className="mt-2 text-sm text-red-600">{errors.email}</div>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1.5">New Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        autoFocus
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white text-sm"
                        placeholder="••••••••"
                    />
                    {errors.password && <div className="mt-2 text-sm text-red-600">{errors.password}</div>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-bold text-slate-700 mb-1.5">Confirm Password</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white text-sm"
                        placeholder="••••••••"
                    />
                    {errors.password_confirmation && <div className="mt-2 text-sm text-red-600">{errors.password_confirmation}</div>}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        Reset Password
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}

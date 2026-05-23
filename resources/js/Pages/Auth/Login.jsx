import React from 'react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 font-medium text-sm text-green-600">
                    {status}
                </div>
            )}

            <div className="mb-10 animate-slide-up stagger-1">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif-custom mb-3">Welcome back</h2>
                <p className="text-slate-400 font-medium text-sm sm:text-base">Sign in to your neighborhood command center.</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Email Address */}
                <div className="animate-slide-up stagger-2">
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoFocus
                        autoComplete="username"
                        className="w-full px-4.5 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all bg-slate-950/40 text-white placeholder-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                        placeholder="name@example.com"
                    />
                    {errors.email && <div className="mt-2 text-sm text-red-400">{errors.email}</div>}
                </div>

                {/* Password */}
                <div className="animate-slide-up stagger-2">
                    <div className="flex items-center justify-between mb-2.5">
                        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full px-4.5 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all bg-slate-950/40 text-white placeholder-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                        placeholder="••••••••"
                    />
                    {errors.password && <div className="mt-2 text-sm text-red-400">{errors.password}</div>}
                </div>

                {/* Remember Me */}
                <div className="flex items-center animate-slide-up stagger-3">
                    <input
                        id="remember_me"
                        type="checkbox"
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-slate-800 bg-slate-950/60 text-indigo-500 focus:ring-indigo-500/50 cursor-pointer transition-colors"
                    />
                    <label htmlFor="remember_me" className="ml-3 text-xs font-semibold text-slate-400 hover:text-slate-350 cursor-pointer select-none transition-colors">
                        Keep me logged in
                    </label>
                </div>

                <div className="animate-slide-up stagger-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className={`btn-magnetic btn-shimmer w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_30px_rgba(99,102,241,0.45)] active:scale-[0.98] ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {processing ? 'Connecting...' : 'Sign In'}
                    </button>
                </div>
            </form>

            <div className="mt-10 text-center text-xs text-slate-500 animate-slide-up stagger-3">
                New to the network?{' '}
                <Link href={route('register')} className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Request access
                </Link>
            </div>
        </GuestLayout>
    );
}

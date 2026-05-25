import React from 'react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ neighborhoods }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        neighborhood_name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-10 animate-slide-up stagger-1">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif-custom mb-3">Create an account</h2>
                <p className="text-slate-400 font-medium text-sm sm:text-base">Join the verified neighborhood safety network.</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Name */}
                <div className="animate-slide-up stagger-2">
                    <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Full Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoFocus
                        autoComplete="name"
                        className="w-full px-4.5 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all bg-slate-950/40 text-white placeholder-slate-650 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                        placeholder="John Doe"
                    />
                    {errors.name && <div className="mt-2 text-sm text-red-400">{errors.name}</div>}
                </div>

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
                        autoComplete="username"
                        className="w-full px-4.5 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all bg-slate-950/40 text-white placeholder-slate-650 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                        placeholder="john@example.com"
                    />
                    {errors.email && <div className="mt-2 text-sm text-red-400">{errors.email}</div>}
                </div>

                {/* Password */}
                <div className="animate-slide-up stagger-2">
                    <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        autoComplete="new-password"
                        className="w-full px-4.5 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all bg-slate-950/40 text-white placeholder-slate-650 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                        placeholder="Create a strong password"
                    />
                    {errors.password && <div className="mt-2 text-sm text-red-400">{errors.password}</div>}
                </div>

                {/* Neighborhood Selection */}
                <div className="animate-slide-up stagger-2">
                    <label htmlFor="neighborhood_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Select Your Neighborhood</label>
                    <select
                        id="neighborhood_name"
                        name="neighborhood_name"
                        value={data.neighborhood_name}
                        onChange={(e) => setData('neighborhood_name', e.target.value)}
                        required
                        className="w-full px-4.5 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all bg-slate-950/40 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] cursor-pointer"
                    >
                        <option value="" disabled className="bg-slate-950 text-slate-500">Select neighborhood safety net...</option>
                        {neighborhoods && neighborhoods.map((nh, index) => (
                            <option key={index} value={nh} className="bg-slate-950 text-white">{nh}</option>
                        ))}
                    </select>
                    {errors.neighborhood_name && <div className="mt-2 text-sm text-red-400">{errors.neighborhood_name}</div>}
                    <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">If your neighborhood is not listed, local authorities must first register your area.</p>
                </div>

                <div className="pt-2 animate-slide-up stagger-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className={`btn-magnetic btn-shimmer w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_30px_rgba(99,102,241,0.45)] active:scale-[0.98] ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        Submit Request
                    </button>
                </div>
            </form>

            <div className="mt-10 text-center text-xs text-slate-500 animate-slide-up stagger-3">
                Already have an account?{' '}
                <Link href={route('login')} className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Log in
                </Link>
                <span className="block mt-2.5">
                    Are you a local authority?{' '}
                    <Link href={route('admin.register')} className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                        Admin Registration
                    </Link>
                </span>
            </div>
        </GuestLayout>
    );
}

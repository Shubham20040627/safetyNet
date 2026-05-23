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

            <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900 font-serif-custom mb-3">Create an account</h2>
                <p className="text-slate-500">Join the verified neighborhood safety network.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoFocus
                        autoComplete="name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white"
                        placeholder="John Doe"
                    />
                    {errors.name && <div className="mt-2 text-sm text-red-600">{errors.name}</div>}
                </div>

                {/* Email Address */}
                <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white"
                        placeholder="john@example.com"
                    />
                    {errors.email && <div className="mt-2 text-sm text-red-600">{errors.email}</div>}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        autoComplete="new-password"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white"
                        placeholder="Create a strong password"
                    />
                    {errors.password && <div className="mt-2 text-sm text-red-600">{errors.password}</div>}
                </div>

                {/* Neighborhood Selection */}
                <div>
                    <label htmlFor="neighborhood_name" className="block text-sm font-bold text-slate-700 mb-2">Select Your Neighborhood</label>
                    <select
                        id="neighborhood_name"
                        name="neighborhood_name"
                        value={data.neighborhood_name}
                        onChange={(e) => setData('neighborhood_name', e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white font-semibold text-slate-700"
                    >
                        <option value="" disabled>Select neighborhood safety net...</option>
                        {neighborhoods && neighborhoods.map((nh, index) => (
                            <option key={index} value={nh}>{nh}</option>
                        ))}
                    </select>
                    {errors.neighborhood_name && <div className="mt-2 text-sm text-red-600">{errors.neighborhood_name}</div>}
                    <p className="text-xs text-slate-400 mt-1">If your neighborhood is not listed, local authorities must first register your area.</p>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        Submit Request
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link href={route('login')} className="font-bold text-indigo-700 hover:text-indigo-600 transition-colors">
                    Log in
                </Link>
                <span className="block mt-2">
                    Are you a local authority?{' '}
                    <Link href={route('admin.register')} className="font-bold text-indigo-700 hover:text-indigo-600 transition-colors">
                        Admin Registration
                    </Link>
                </span>
            </div>
        </GuestLayout>
    );
}

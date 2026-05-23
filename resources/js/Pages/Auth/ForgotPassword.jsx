import React from 'react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 font-serif-custom mb-3">Recover Password</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
                </p>
            </div>

            {status && (
                <div className="mb-4 font-semibold text-sm text-green-600 bg-green-50 border border-green-100 p-3.5 rounded-xl">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white"
                        placeholder="officer@safetynet.com"
                    />
                    {errors.email && <div className="mt-2 text-sm text-red-600">{errors.email}</div>}
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        Email Password Reset Link
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}

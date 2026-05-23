import React from 'react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm();

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 font-serif-custom mb-3">Verify Email</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-6 font-semibold text-sm text-green-600 bg-green-50 border border-green-100 p-3.5 rounded-xl">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        Resend Verification Email
                    </button>
                </div>
            </form>

            <form onSubmit={handleLogout} className="mt-4">
                <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm cursor-pointer"
                >
                    Log Out
                </button>
            </form>
        </GuestLayout>
    );
}

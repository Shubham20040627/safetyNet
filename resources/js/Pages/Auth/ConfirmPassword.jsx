import React from 'react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'));
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 font-serif-custom mb-3">Confirm Password</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                    This is a secure area of the application. Please confirm your password before continuing.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white"
                        placeholder="••••••••"
                    />
                    {errors.password && <div className="mt-2 text-sm text-red-600">{errors.password}</div>}
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        Confirm Password
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}

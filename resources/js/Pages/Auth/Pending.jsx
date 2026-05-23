import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Pending() {
    const { post } = useForm();

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-6">
            <Head title="Account Pending - SafetyNet" />
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100">
                <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Verification Pending</h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Thank you for joining <strong>SafetyNet</strong>. Your account is currently pending approval by an administrator. This is part of our commitment to community safety.
                </p>
                
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-8">
                    <p className="text-amber-800 text-sm font-medium">
                        You will gain access to the dashboard once an administrator approves your request.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <form onSubmit={handleLogout}>
                        <button type="submit" className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition cursor-pointer">
                            Logout and Return Later
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

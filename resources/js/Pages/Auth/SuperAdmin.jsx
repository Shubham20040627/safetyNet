import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function SuperAdmin({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('superadmin.login'));
    };

    return (
        <div className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-cyber-grid">
            <Head title="SafetyNet — System Nexus Command Console" />
            
            <style>
                {`
                .font-serif-custom { font-family: 'Merriweather', serif; }
                
                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.25; transform: scale(1.05); }
                }

                @keyframes rotateConsole {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .animate-pulse-glow {
                    animation: pulseGlow 8s ease-in-out infinite;
                }

                .animate-rotate-console {
                    animation: rotateConsole 40s linear infinite;
                }

                .bg-cyber-grid {
                    background-size: 40px 40px;
                    background-image: 
                        linear-gradient(to right, rgba(99, 102, 241, 0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
                }
                `}
            </style>

            {/* Radical Blur Background Elements */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-glow"></div>
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '-4s' }}></div>

            {/* System Console Ring Overlay */}
            <div className="absolute -top-32 -right-32 w-96 h-96 border border-indigo-500/10 rounded-full pointer-events-none flex items-center justify-center animate-rotate-console">
                <div className="w-80 h-80 border border-dashed border-indigo-500/5 rounded-full"></div>
                <div className="w-64 h-64 border border-indigo-500/20 rounded-full"></div>
            </div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 border border-violet-500/10 rounded-full pointer-events-none flex items-center justify-center animate-rotate-console" style={{ animationDirection: 'reverse' }}>
                <div className="w-80 h-80 border border-dashed border-violet-500/5 rounded-full"></div>
                <div className="w-64 h-64 border border-violet-500/20 rounded-full"></div>
            </div>

            {/* Glassmorphism Login Container */}
            <div className="w-full max-w-md relative z-10">
                
                {/* Branding Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-slate-900/80 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.25)] relative group overflow-hidden">
                        <div className="absolute inset-x-0 h-0.5 bg-indigo-500/60 top-0 group-hover:translate-y-16 transition-all duration-1000 ease-in-out shadow-[0_0_10px_#6366f1]"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black tracking-[0.25em] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full uppercase">Superadmin Portal</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-2">System Nexus</h1>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider text-center">Authorized Layer-1 safety credentials required</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/50 backdrop-blur-2xl border border-indigo-500/20 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5),_0_0_60px_-15px_rgba(99,102,241,0.15)] relative">
                    
                    {/* Inner Neon Corner Overlays */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-500/40 rounded-tl-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-500/40 rounded-br-3xl"></div>

                    {/* Session Status */}
                    {status && (
                        <div className="mb-6 text-sm text-green-400 font-medium">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Address */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Secure Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401 9.049 9.049 0 01-1.378-.29 1 1 0 11.51-1.935 7.049 7.049 0 001.227.124 1 1 0 001-1V5.757z" clipRule="evenodd"/>
                                    </svg>
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                    autoComplete="username"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition bg-slate-950/80 text-white placeholder-slate-600 text-sm shadow-inner"
                                    placeholder="superadmin@safety.com"
                                />
                            </div>
                            {errors.email && <div className="mt-2.5 text-xs text-red-400 font-medium">{errors.email}</div>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Security Access Key</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition bg-slate-950/80 text-white placeholder-slate-600 text-sm shadow-inner"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <div className="mt-2.5 text-xs text-red-400 font-medium">{errors.password}</div>}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                id="remember_me"
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950 cursor-pointer"
                            />
                            <label htmlFor="remember_me" className="ml-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 cursor-pointer select-none">Remember Device</label>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.5)] active:scale-[0.98] cursor-pointer ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                Initialize Login Sequence
                            </button>
                        </div>
                    </form>
                </div>

                {/* Portal Footer Info */}
                <div className="mt-6 text-center">
                    <Link href={route('login')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Return to Citizen Node
                    </Link>
                </div>
            </div>
        </div>
    );
}

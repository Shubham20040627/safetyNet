import React, { useEffect } from 'react';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    // Parallax mouse interaction hook
    useEffect(() => {
        const handleMouseMove = (e) => {
            const parallaxElements = document.querySelectorAll('.parallax-move');
            parallaxElements.forEach((el) => {
                const speed = parseFloat(el.getAttribute('data-parallax-speed') || '15');
                const x = (window.innerWidth / 2 - e.clientX) / speed;
                const y = (window.innerHeight / 2 - e.clientY) / speed;
                el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="font-sans text-slate-100 antialiased bg-[#030712] overflow-x-hidden overflow-y-auto lg:overflow-hidden relative min-h-screen">
            <style>
                {`
                .font-serif-custom { font-family: 'Merriweather', serif; }
                
                /* Apple-level entrance animations */
                @keyframes slideUpFade {
                    0% { opacity: 0; transform: translateY(40px) scale(0.98); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes imageZoom {
                    0% { transform: scale(1.08); filter: blur(5px); }
                    100% { transform: scale(1); filter: blur(0); }
                }

                .animate-slide-up {
                    animation: slideUpFade 1.2s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
                }

                .animate-image-entrance {
                    animation: imageZoom 2.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
                }

                .stagger-1 { animation-delay: 0.1s; }
                .stagger-2 { animation-delay: 0.2s; }
                .stagger-3 { animation-delay: 0.3s; }

                /* Float Animations */
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float-slow {
                    animation: float-slow 5s ease-in-out infinite;
                }
                .animate-float-medium {
                    animation: float-medium 4.2s ease-in-out infinite;
                }

                /* Light Sweep Animation */
                @keyframes light-sweep {
                    0% { left: -100%; }
                    50%, 100% { left: 200%; }
                }
                .light-sweep {
                    position: absolute;
                    top: 0; width: 40%; height: 100%;
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.04) 50%, transparent);
                    transform: skewX(-20deg);
                    animation: light-sweep 9s ease-in-out infinite;
                    pointer-events: none;
                    z-index: 5;
                }

                /* Shivering film grain animation */
                @keyframes noise-animation {
                    0% { transform: translate(0,0) }
                    10% { transform: translate(-0.5%,-0.5%) }
                    20% { transform: translate(-1%,0.5%) }
                    30% { transform: translate(0.5%,-1%) }
                    40% { transform: translate(-0.5%,1.5%) }
                    50% { transform: translate(-1%,0.5%) }
                    60% { transform: translate(1.5%,-0.5%) }
                    70% { transform: translate(1%,0.5%) }
                    80% { transform: translate(-1.5%,-1%) }
                    90% { transform: translate(0.5%,1%) }
                    100% { transform: translate(0,0) }
                }
                .noise-overlay {
                    position: absolute; top: -20%; left: -20%; width: 140%; height: 140%;
                    background: url('https://grainy-gradients.vercel.app/noise.svg');
                    opacity: 0.035; pointer-events: none; z-index: 40;
                    animation: noise-animation 0.5s steps(5) infinite;
                }
                
                .btn-shimmer {
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.3s cubic-bezier(0.1, 0.9, 0.2, 1), box-shadow 0.3s cubic-bezier(0.1, 0.9, 0.2, 1);
                }
                .btn-shimmer::after {
                    content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                    transform: rotate(45deg); animation: shimmer 4s infinite;
                }
                @keyframes shimmer { 0% { left: -150%; } 100% { left: 150%; } }
                `}
            </style>
            
            <div className="min-h-screen flex">
                {/* Left Side: Real Photography with Cinematic Overlays */}
                <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-950">
                    <img src="/images/branding/auth_real.png" 
                         alt="Peaceful Neighborhood" 
                         className="w-full h-full object-cover animate-image-entrance opacity-75 parallax-move"
                         data-parallax-speed="40" />
                    
                    {/* Dark Blue Cinematic Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#030712] via-slate-950/40 to-transparent pointer-events-none z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/30 via-transparent to-transparent pointer-events-none z-10"></div>
                    
                    {/* Animated Light Sweep */}
                    <div className="light-sweep"></div>
                    
                    {/* Shivering Noise Overlay */}
                    <div className="noise-overlay"></div>

                    {/* Floating Glassmorphism Alert Card 1 */}
                    <div className="absolute top-[16%] left-[8%] bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] animate-float-slow select-none parallax-move z-20" data-parallax-speed="9">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center relative">
                            <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        </div>
                        <div>
                            <h4 className="font-bold text-xs tracking-wide text-white/95 uppercase">Neighborhood Verified</h4>
                            <p className="text-[9px] text-white/60 font-medium">Safe Network Approved</p>
                        </div>
                    </div>

                    {/* Floating Glassmorphism Alert Card 2 */}
                    <div className="absolute top-[48%] right-[8%] bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] animate-float-medium select-none parallax-move z-20" data-parallax-speed="-14">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center relative">
                            <span className="absolute w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                            <span className="relative w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        </div>
                        <div>
                            <h4 className="font-bold text-xs tracking-wide text-white/95 uppercase">Incident Alert Nearby</h4>
                            <p className="text-[9px] text-rose-400 font-medium">Corridor Active • 2 mins ago</p>
                        </div>
                    </div>

                    {/* Floating Glassmorphism Alert Card 3 */}
                    <div className="absolute bottom-[18%] left-[8%] bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] animate-float-slow select-none parallax-move z-20" data-parallax-speed="7" style={{animationDelay: '-2s'}}>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center relative">
                            <span className="absolute w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                            <span className="relative w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                        </div>
                        <div>
                            <h4 className="font-bold text-xs tracking-wide text-white/95 uppercase">End-to-End Protected</h4>
                            <p className="text-[9px] text-indigo-300 font-semibold">Active Encryption</p>
                        </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center p-12 z-20">
                        <div className="max-w-md text-white animate-slide-up stagger-1">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-extrabold font-serif-custom mb-6 leading-tight tracking-tight text-white">Handcrafted safety <br/>for real neighborhoods.</h1>
                            <p className="text-base text-slate-300 leading-relaxed font-medium">
                                Sign in to join a vetted network of residents collaborating with administrators to protect local corridors.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form Content with cinematic dark gradient backdrop and animated glows */}
                <div className="w-full lg:w-1/2 flex justify-center p-8 sm:p-12 lg:p-20 relative bg-[#060a13] overflow-y-auto h-screen border-l border-slate-900">
                    
                    {/* Animated Blurred Glow Blobs */}
                    <div className="absolute top-[10%] right-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none animate-float-slow"></div>
                    <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none animate-float-medium" style={{animationDelay: '-2s'}}></div>

                    <div className="w-full max-w-md my-auto animate-slide-up stagger-2 py-8 relative z-10">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-slate-950 text-white border border-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white font-serif-custom">SafetyNet.</span>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

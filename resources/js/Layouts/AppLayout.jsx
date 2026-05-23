import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function AppLayout({ header, children }) {
    const { auth, flash, ziggy } = usePage().props;
    const user = auth.user;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // SOS State
    const [sosModalOpen, setSosModalOpen] = useState(false);
    const [countdownVal, setCountdownVal] = useState(3);
    const [activeBannerAlert, setActiveBannerAlert] = useState(null);
    const [mySosAlert, setMySosAlert] = useState(null);
    const [notification, setNotification] = useState(null);

    // Chatbot State
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { id: 'welcome', sender: 'ai', text: `Hello ${user?.name || 'there'}! I am your SafetyNet AI Guardian. I can provide general first-aid guidance, help you report incidents, or analyze recent activity in your neighborhood. How can I help you today?` }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, chatLoading]);

    const handleSendChatMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || chatLoading) return;

        const userMsg = chatInput.trim();
        const userMsgId = Date.now().toString();
        
        setChatMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: userMsg }]);
        setChatInput('');
        setChatLoading(true);

        axios.post(route('ai.chat'), { message: userMsg })
            .then(res => {
                setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: res.data.response }]);
            })
            .catch(err => {
                console.error("AI Chat failed", err);
                setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: "I'm sorry, I'm having trouble connecting to my safety protocols right now." }]);
            })
            .finally(() => {
                setChatLoading(false);
            });
    };

    const sosTimer = useRef(null);
    const activeAlarmInterval = useRef(null);
    const audioCtx = useRef(null);
    const notificationTimeout = useRef(null);

    // Audio context initialization
    const playSiren = () => {
        if (activeAlarmInterval.current) return;
        try {
            audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio not supported", e);
            return;
        }

        let toggle = false;
        activeAlarmInterval.current = setInterval(() => {
            if (!audioCtx.current) return;
            let osc = audioCtx.current.createOscillator();
            let gain = audioCtx.current.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(toggle ? 880 : 550, audioCtx.current.currentTime);
            gain.gain.setValueAtTime(0.12, audioCtx.current.currentTime);
            osc.connect(gain);
            gain.connect(audioCtx.current.destination);
            osc.start();
            osc.stop(audioCtx.current.currentTime + 0.35);
            toggle = !toggle;
        }, 500);
    };

    const stopSiren = () => {
        if (activeAlarmInterval.current) {
            clearInterval(activeAlarmInterval.current);
            activeAlarmInterval.current = null;
        }
    };

    const triggerSOSModal = () => {
        setSosModalOpen(true);
        setCountdownVal(3);
        
        let cv = 3;
        sosTimer.current = setInterval(() => {
            cv--;
            if (cv <= 0) {
                clearInterval(sosTimer.current);
                setSosModalOpen(false);
                broadcastSOS();
            } else {
                setCountdownVal(cv);
            }
        }, 1000);
    };

    const cancelSOS = () => {
        if (sosTimer.current) {
            clearInterval(sosTimer.current);
            sosTimer.current = null;
        }
        setSosModalOpen(false);
    };

    const broadcastSOS = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                submitSOS(position.coords.latitude, position.coords.longitude);
            }, () => {
                submitSOS(null, null);
            });
        } else {
            submitSOS(null, null);
        }
    };

    const submitSOS = (lat, lng) => {
        axios.post(route('sos.store'), { latitude: lat, longitude: lng })
            .then(res => {
                if (res.data.success) {
                    setMySosAlert(res.data.alert);
                    pollMySOSStatus();
                }
            })
            .catch(err => console.error("SOS failed", err));
    };

    const pollMySOSStatus = () => {
        axios.get(route('sos.my-active'))
            .then(res => {
                if (res.data.success && res.data.alert) {
                    setMySosAlert(res.data.alert);
                } else {
                    setMySosAlert(null);
                }
            })
            .catch(err => console.error("Poll my active SOS failed", err));
    };

    const acknowledgeActiveEmergency = () => {
        if (!activeBannerAlert) return;
        axios.post(`/sos/${activeBannerAlert.id}/acknowledge`)
            .then(res => {
                if (res.data.success) {
                    setActiveBannerAlert(prev => ({...prev, acknowledged: true}));
                    stopSiren();
                }
            })
            .catch(err => console.error("SOS acknowledge failed", err));
    };

    const resolveActiveEmergency = () => {
        if (!activeBannerAlert) return;
        axios.post(`/sos/${activeBannerAlert.id}/resolve`)
            .then(res => {
                if (res.data.success) {
                    setActiveBannerAlert(null);
                    stopSiren();
                }
            })
            .catch(err => console.error("SOS resolve failed", err));
    };

    const dismissEmergencyBanner = () => {
        setActiveBannerAlert(null);
        stopSiren();
    };

    const resolveOwnSOS = () => {
        if (!mySosAlert) return;
        axios.post(`/sos/${mySosAlert.id}/resolve`)
            .then(res => {
                if (res.data.success) {
                    pollMySOSStatus();
                }
            })
            .catch(err => console.error("SOS resolve failed", err));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            axios.get(route('sos.active'))
                .then(res => {
                    if (res.data.success && res.data.alerts.length > 0) {
                        setActiveBannerAlert(res.data.alerts[0]);
                        playSiren();
                    } else {
                        setActiveBannerAlert(null);
                        stopSiren();
                    }
                })
                .catch(err => console.error("SOS active check failed", err));
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(pollMySOSStatus, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (window.Echo) {
            window.Echo.channel('incidents')
                .listen('.IncidentReported', (data) => {
                    setNotification(data);
                    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
                    notificationTimeout.current = setTimeout(() => setNotification(null), 5000);
                });

            window.Echo.channel('sos-alerts')
                .listen('.SosAlertBroadcast', (alert) => {
                    if (alert.status === 'active') {
                        setActiveBannerAlert(alert);
                        playSiren();
                    } else if (alert.status === 'resolved') {
                        setActiveBannerAlert(prev => prev && prev.id === alert.id ? null : prev);
                        stopSiren();
                    }
                });
        }
    }, []);

    const isActive = (routeName) => {
        return route().current(routeName);
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden bg-[#020408] font-jakarta">
            {/* Ambient Background Structure */}
            <div className="dashboard-bg fixed inset-0 z-[-2]" style={{
                background: "radial-gradient(circle at top center, #090e20 0%, #020408 100%)",
                backgroundSize: 'cover',
            }}></div>

            {/* Premium Glowing Ambient Orbs */}
            <div className="glow-blob glow-indigo w-[600px] h-[600px] -top-80 -left-60"></div>
            <div className="glow-blob glow-emerald w-[700px] h-[700px] -bottom-80 -right-80"></div>
            <div className="glow-blob glow-violet w-[500px] h-[500px] top-[30%] left-[65%]"></div>

            {/* Cinematic Grain Overlay */}
            <div className="grain-overlay"></div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/85 z-40 md:hidden backdrop-blur-md"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-slate-950/95 backdrop-blur-2xl border-r border-slate-900 text-white z-50 shadow-2xl md:hidden overflow-y-auto transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between border-b border-slate-900/60 bg-slate-950/20">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-widest text-indigo-400 font-jakarta">SafetyNet</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition border border-transparent hover:border-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <nav className="mt-6 px-4 pb-4">
                    <NavigationLinks user={user} isActive={isActive} />
                </nav>

                {/* Mobile Sidebar User Footer */}
                <div className="border-t border-slate-900/60 p-4 mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-black text-indigo-300">{user?.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">{user?.role}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Locked/Toggle Sidebar */}
            <div 
                className={`fixed top-0 left-0 h-screen w-64 bg-[#05080e]/85 backdrop-blur-3xl text-white z-50 border-r border-slate-900/60 transition-transform duration-300 ease-in-out hidden md:flex md:flex-col transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-[10px_0_40px_rgba(0,0,0,0.6)]`}
            >
                <div className="p-6 border-b border-slate-900/50 bg-[#05080e]/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-900 text-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-800/40 relative shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-widest text-slate-100 font-jakarta">SafetyNet</span>
                    </div>
                </div>
                
                <nav className="mt-6 px-4 pb-4 flex-1 overflow-y-auto">
                    <NavigationLinks user={user} isActive={isActive} />
                </nav>

                <div className="border-t border-slate-900/50 bg-[#04070b]/80 p-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600/30 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <span className="text-sm font-black text-indigo-300">{user?.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate font-jakarta">{user?.name}</p>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400/80 font-mono">{user?.role?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex-shrink-0">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:pl-64' : 'md:pl-0'}`}>
                {/* Top Navbar */}
                <header className="glass-header border-b border-slate-900/60 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 bg-[#04070c]/50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition border border-slate-800/80 bg-slate-950/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex p-2.5 rounded-xl bg-slate-950/60 text-indigo-400 hover:text-white hover:bg-indigo-600 transition shadow flex-shrink-0 items-center justify-center cursor-pointer border border-indigo-950/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="text-sm font-extrabold tracking-widest text-slate-100 uppercase truncate font-jakarta">
                                {header || 'Dashboard'}
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-950/40 border border-slate-900/60 px-2.5 py-1 rounded-lg ml-2 hidden lg:flex">
                                <span className="pulse-indicator-dot relative"></span>
                                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">System Online</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {user && user.role !== 'super_admin' && (
                            <button onClick={triggerSOSModal} className="inline-flex items-center justify-center px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 rounded-xl transition duration-200 shadow-md border border-red-700/30 active:scale-95">
                                🚨 Emergency SOS
                            </button>
                        )}

                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/80 hidden sm:inline">User: {user?.name}</span>
                        <Link href={route('logout')} method="post" as="button" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-red-600/10 hover:border-red-500/30 border border-slate-900/50 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all duration-300 whitespace-nowrap shadow-sm cursor-pointer bg-slate-950/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </Link>
                    </div>
                </header>

                {/* Flash Messages */}
                {(flash.success || flash.error) && (
                    <div className="px-4 md:px-8 mt-5">
                        {flash.success && (
                            <div className="premium-card flex items-center gap-3 px-4 py-3 rounded-xl border-l-2 border-l-emerald-500 border border-slate-800/60 text-emerald-300 text-sm font-medium shadow-md">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                {flash.success}
                            </div>
                        )}
                        {flash.error && (
                            <div className="premium-card flex items-center gap-3 px-4 py-3 rounded-xl border-l-2 border-l-red-500 border border-slate-800/60 text-red-300 text-sm font-medium shadow-md">
                                <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                {flash.error}
                            </div>
                        )}
                    </div>
                )}

                <main className="p-4 md:p-8 flex-1">
                    {children}
                </main>
            </div>

            {/* SOS Modal */}
            {sosModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl border border-red-100 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-50 rounded-full -z-10 animate-pulse"></div>
                        <div className="text-red-600 mb-4 animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900">Broadcasting SOS Alert</h3>
                        <p className="text-slate-500 text-sm mt-2">Triggering neighborhood emergency panic signal in...</p>
                        <div className="text-7xl font-black text-red-600 my-6 animate-ping">{countdownVal}</div>
                        <button onClick={cancelSOS} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-md">
                            Cancel Emergency
                        </button>
                    </div>
                </div>
            )}

            {/* Emergency Banner */}
            <div className={`fixed bottom-6 right-6 z-[100] max-w-md w-full bg-red-600 text-white rounded-2xl shadow-2xl border border-red-500 overflow-hidden transform transition-all duration-500 ease-out ${activeBannerAlert ? 'translate-y-0 opacity-100' : 'translate-y-[calc(100%+1.5rem)] opacity-0 pointer-events-none'}`}>
                <div className="p-6 relative">
                    <div className="absolute top-2 right-2">
                        <button onClick={dismissEmergencyBanner} className="p-1 hover:bg-white/10 rounded-lg transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Active Emergency</span>
                            <h4 className="text-lg font-black mt-1 leading-snug">
                                <span>{activeBannerAlert?.user?.name || activeBannerAlert?.user_name || 'Resident'}</span> needs urgent assistance!
                            </h4>
                            <p className="text-xs text-red-100 mt-1 leading-relaxed">
                                An SOS signal has been triggered. Please verify their location and offer immediate help.
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {activeBannerAlert?.latitude && activeBannerAlert?.longitude && (
                                    <a href={`https://www.google.com/maps?q=${activeBannerAlert.latitude},${activeBannerAlert.longitude}`} target="_blank" className="bg-white text-red-600 px-3.5 py-2 rounded-xl text-xs font-black shadow-md hover:bg-red-50 transition flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        Map
                                    </a>
                                )}
                                <button onClick={acknowledgeActiveEmergency} disabled={activeBannerAlert?.acknowledged} className="bg-amber-400 text-slate-900 px-3.5 py-2 rounded-xl text-xs font-black shadow-md hover:bg-amber-350 transition flex items-center gap-1">
                                    {activeBannerAlert?.acknowledged ? '🤝 Dispatched!' : '🤝 Dispatch Help'}
                                </button>
                                {user?.role === 'admin' && (
                                    <button onClick={resolveActiveEmergency} className="bg-red-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-red-900 transition border border-red-700">
                                        Resolve Signal
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* My SOS Tracker */}
            {mySosAlert && (
                <div className={`fixed bottom-6 left-6 z-[100] max-w-sm w-full p-6 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${mySosAlert.status === 'active' ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-emerald-950 border border-emerald-800 text-white'}`}>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${mySosAlert.status === 'active' ? 'bg-red-600/20 text-red-500 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 animate-bounce'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-base font-black">
                                {mySosAlert.status === 'active' ? 'SOS Signal Active' : '🚨 HELP IS ARRIVING!'}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">
                                {mySosAlert.status === 'active' ? 'Your emergency signal is active. Waiting for neighborhood dispatch response...' : 'Assistance has been dispatched to your location. Please stay calm and stay safe.'}
                            </p>
                            <div className="mt-4">
                                <button onClick={resolveOwnSOS} className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md hover:bg-red-700 transition">
                                    Mark Safe & Resolve
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full transition-all duration-700 animate-pulse ${mySosAlert.status === 'active' ? 'bg-red-600/10' : 'bg-emerald-500/20'}`}></div>
                </div>
            )}

            {/* Realtime Notification Toast */}
            <div className={`fixed top-6 right-6 z-[110] max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden transform transition-all duration-700 ease-in-out ${notification ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+1.5rem)] opacity-0 pointer-events-none'}`}>
                <div className="p-5 relative">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div className="flex-1 pr-6">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${notification?.type === 'crime' ? 'bg-red-500/20 text-red-300' : notification?.type === 'accident' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                                    {notification?.type?.toUpperCase() || 'NEW INCIDENT'}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm ${notification?.priority === 'critical' ? 'bg-red-600 text-white' : notification?.priority === 'high' ? 'bg-orange-100 text-orange-600 border border-orange-200' : notification?.priority === 'medium' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                    {notification?.priority?.toUpperCase() || 'PRIORITY'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">JUST NOW</span>
                            </div>
                            <h4 className="text-sm font-black mt-1 leading-tight">{notification?.title || 'Emergency Reported'}</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {notification?.message || 'A new incident has been reported in your vicinity.'}
                            </p>
                        </div>
                        <button onClick={() => setNotification(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Chatbot Floating Widget */}
            {user && (
                <>
                        {/* Chat Window */}
                        <div className={`fixed right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[480px] bg-slate-950 border border-slate-800 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${activeBannerAlert ? 'bottom-[328px]' : 'bottom-22'} ${chatOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-6 pointer-events-none'}`}>
                            {/* Header */}
                            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                                        AI
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                                            AI Assistant
                                        </h4>
                                        <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Online & Verified</p>
                                    </div>
                                </div>
                                <button onClick={() => setChatOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} incident-entry-animate`}>
                                        <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-[0_4px_15px_rgba(99,102,241,0.25)]' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'}`}>
                                            <p className="whitespace-pre-line">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {chatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-900 border border-slate-800 rounded-xl rounded-bl-none p-3 text-xs text-slate-400 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendChatMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                                <input 
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask about safety, reports, or first-aid..."
                                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
                                    disabled={chatLoading}
                                />
                                <button 
                                    type="submit" 
                                    className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition shadow-md active:scale-95 disabled:opacity-50"
                                    disabled={chatLoading || !chatInput.trim()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>

                        {/* Floating Toggle Button */}
                        <button 
                            onClick={() => setChatOpen(!chatOpen)}
                            className={`fixed z-50 w-12 h-12 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-slate-100 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-slate-800 ${activeBannerAlert ? 'bottom-[260px]' : 'bottom-6'} right-6 group`}
                        >
                            <div className="relative w-6 h-6 flex items-center justify-center">
                                {chatOpen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                )}
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                                </span>
                            </div>
                        </button>
                    </>
                )}
            </div>
        );
}

function NavigationLinks({ user, isActive }) {
    if (!user) return null;

    const getLinkClass = (active) => {
        return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 mb-2 font-bold text-[11px] uppercase tracking-widest border relative group ${
            active
                ? 'nav-item-active text-white border-indigo-500/20 shadow-sm'
                : 'border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-slate-100 hover:border-slate-800/40'
        }`;
    };

    return (
        <>
            {user.role !== 'super_admin' && (
                <>
                    <Link href={route('dashboard')} className={getLinkClass(isActive('dashboard'))}>
                        {isActive('dashboard') && <span className="nav-active-bar"></span>}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a11 11 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link href={route('announcements.list')} className={getLinkClass(isActive('announcements.list'))}>
                        {isActive('announcements.list') && <span className="nav-active-bar"></span>}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                        Community Notices
                    </Link>
                    <Link href={route('reports.heatmap')} className={getLinkClass(isActive('reports.heatmap'))}>
                        {isActive('reports.heatmap') && <span className="nav-active-bar"></span>}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Security Heatmap
                    </Link>
                    <Link href={route('reports.index')} className={getLinkClass(isActive('reports.index'))}>
                        {isActive('reports.index') && <span className="nav-active-bar"></span>}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        All Reports
                    </Link>
                    <Link href={route('reports.create')} className={getLinkClass(isActive('reports.create'))}>
                        {isActive('reports.create') && <span className="nav-active-bar"></span>}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Report Incident
                    </Link>
                    <Link href={route('reports.my-reports')} className={getLinkClass(isActive('reports.my-reports'))}>
                        {isActive('reports.my-reports') && <span className="nav-active-bar"></span>}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Reports
                    </Link>
                </>
            )}

            {(user.role === 'responder' || user.role === 'admin') && (
                <Link href={route('reports.assignments')} className={getLinkClass(isActive('reports.assignments'))}>
                    {isActive('reports.assignments') && <span className="nav-active-bar"></span>}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                    </svg>
                    {user.role === 'admin' ? 'Active Dispatches' : 'My Assignments'}
                </Link>
            )}

            {user.role === 'admin' && (
                <>
                    <div className="mt-8 mb-3 px-3.5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Admin Panel</div>
                    <Link href={route('admin.analytics')} className={getLinkClass(isActive('admin.analytics'))}>
                        {isActive('admin.analytics') && <span className="nav-active-bar"></span>}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Security Analytics
                    </Link>
                    <Link href={route('admin.users')} className={getLinkClass(isActive('admin.users'))}>
                        {isActive('admin.users') && <span className="nav-active-bar"></span>}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Manage Users
                    </Link>
                    <Link href={route('admin.reports')} className={getLinkClass(isActive('admin.reports'))}>
                        {isActive('admin.reports') && <span className="nav-active-bar"></span>}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Manage Reports
                    </Link>
                    <Link href={route('admin.announcements.index')} className={getLinkClass(route().current('admin.announcements.*'))}>
                        {route().current('admin.announcements.*') && <span className="nav-active-bar"></span>}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                        Announcements
                    </Link>
                </>
            )}

            {user.role === 'super_admin' && (
                <>
                    <div className="mt-8 mb-3 px-3.5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Super Admin</div>
                    <Link href={route('superadmin.dashboard')} className={getLinkClass(isActive('superadmin.dashboard'))}>
                        {isActive('superadmin.dashboard') && <span className="nav-active-bar"></span>}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400/80 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Master Control
                    </Link>
                </>
            )}
        </>
    );
}

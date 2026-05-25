import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import axios from 'axios';
import Chart from 'chart.js/auto';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function Dashboard({
    totalReports: initialTotalReports, myReports: initialMyReports, latestReports: initialLatestReports,
    typeData, statusData, announcements, 
    fullHourlyData: initialFullHourlyData, 
    weeklyTrend: initialWeeklyTrend, 
    peakTime: initialPeakTime,
    trendDirection: initialTrendDirection, 
    trendPercent: initialTrendPercent
}) {
    const { auth } = usePage().props;
    const user = auth.user;

    // Live state — updated by polling
    const [liveTotal, setLiveTotal]         = useState(initialTotalReports);
    const [liveMyReports, setLiveMyReports] = useState(initialMyReports);
    const [liveReports, setLiveReports]     = useState(initialLatestReports);
    const [liveWeekly, setLiveWeekly]       = useState(initialWeeklyTrend);
    const [liveHourly, setLiveHourly]       = useState(initialFullHourlyData);
    const [livePeakTime, setLivePeakTime]   = useState(initialPeakTime);
    const [liveTrendDirection, setLiveTrendDirection] = useState(initialTrendDirection);
    const [liveTrendPercent, setLiveTrendPercent] = useState(initialTrendPercent);
    const [lastUpdated, setLastUpdated]     = useState(null);
    const [tickerEvents, setTickerEvents]   = useState(
        (initialLatestReports || []).map(r => ({
            id: r.id,
            title: r.title,
            type: r.type,
            priority: r.priority,
            location: r.location,
            time: dayjs(r.created_at).format('HH:mm:ss'),
            isSimulated: r.is_simulated,
        }))
    );
    const [isLive, setIsLive]               = useState(false);
    const [sandboxLoading, setSandboxLoading] = useState(null); // 'seed' | 'push' | 'clear' | null
    const [sandboxMsg, setSandboxMsg]         = useState(null);
    const tickerRef = useRef(null);

    // Aliases for readability
    const totalReports   = liveTotal;
    const myReports      = liveMyReports;
    const latestReports  = liveReports;
    const fullHourlyData = liveHourly;
    const peakTime       = livePeakTime;
    const trendDirection = liveTrendDirection;
    const trendPercent   = liveTrendPercent;

    const trendCtx = useRef(null);
    const hourlyCtx = useRef(null);
    const typeCtx = useRef(null);
    const statusCtx = useRef(null);

    const trendChart = useRef(null);
    const hourlyChart = useRef(null);
    const typeChart = useRef(null);
    const statusChart = useRef(null);

    // Mouse movement spotlight tracking and 3D tilt effect
    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3; // Max 3 degrees tilt
        const rotateY = ((x - centerX) / centerX) * 3;

        card.style.transition = 'transform 0.08s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease';
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    };

    const handleMouseLeave = (e) => {
        const card = e.currentTarget;
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    // ─── Sandbox Actions (instant fetch, no page reload) ──────────────────────
    // Ref is populated inside the polling useEffect so we can call it from here
    const pollLiveStatsRef = useRef(null);

    const runSandboxAction = async (action) => {
        if (sandboxLoading) return;
        setSandboxLoading(action);
        setSandboxMsg(null);

        const urls = {
            seed:  '/admin/seed-demo-data',
            push:  '/admin/push-demo-incident',
            clear: '/admin/clear-demo-data',
        };

        try {
            const res = await axios.post(urls[action]);

            if (res.data.success) {
                setSandboxMsg({ type: 'success', text: res.data.message });
                // Immediately refresh all dashboard stats using the polling fn
                if (pollLiveStatsRef.current) await pollLiveStatsRef.current();
            } else {
                setSandboxMsg({ type: 'error', text: 'Action failed. Please try again.' });
            }
        } catch (e) {
            const errorMsg = e.response?.data?.message || 'Network error. Please try again.';
            setSandboxMsg({ type: 'error', text: errorMsg });
        } finally {
            setSandboxLoading(null);
            // Auto-dismiss message after 4s
            setTimeout(() => setSandboxMsg(null), 4000);
        }
    };

    // Staggered reveal animation logic on scroll
    useEffect(() => {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        
        let intersectQueue = [];
        let timeoutId = null;

        const processQueue = () => {
            intersectQueue.forEach((el, index) => {
                el.style.transitionDelay = `${index * 0.05}s`;
                el.classList.add('revealed');
            });
            intersectQueue = [];
            timeoutId = null;
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    observer.unobserve(el);
                    intersectQueue.push(el);
                    if (!timeoutId) {
                        timeoutId = setTimeout(processQueue, 16);
                    }
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
        
        revealElements.forEach(el => observer.observe(el));
        return () => {
            observer.disconnect();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        // Render Trend Chart
        if (trendCtx.current) {
            if (trendChart.current) trendChart.current.destroy();
            
            const ctx = trendCtx.current.getContext('2d');
            
            // Create fill gradient
            const fillGrad = ctx.createLinearGradient(0, 0, 0, 300);
            fillGrad.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
            fillGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.02)');
            fillGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
            
            trendChart.current = new Chart(trendCtx.current, {
                type: 'line',
                data: {
                    labels: Object.keys(liveWeekly),
                    datasets: [{
                        label: 'Incidents',
                        data: Object.values(liveWeekly),
                        borderColor: '#6366f1',
                        backgroundColor: fillGrad,
                        fill: true,
                        tension: 0.35,
                        borderWidth: 2,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#090d16',
                        pointBorderWidth: 1.5,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: '#ffffff',
                        pointHoverBorderColor: '#6366f1',
                        pointHoverBorderWidth: 2.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1200,
                        easing: 'easeOutQuart'
                    },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            border: { display: false },
                            ticks: { 
                                stepSize: 1, 
                                color: '#94a3b8', 
                                font: { family: 'Inter', size: 10, weight: '500' },
                                padding: 8
                            }, 
                            grid: { 
                                color: 'rgba(255, 255, 255, 0.04)',
                                borderDash: [4, 4],
                                drawTicks: false
                            } 
                        },
                        x: { 
                            border: { display: false },
                            ticks: { 
                                color: '#94a3b8', 
                                font: { family: 'Inter', size: 10, weight: '500' },
                                padding: 8
                            }, 
                            grid: { 
                                display: false 
                            } 
                        }
                    },
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#0b0f19',
                            titleColor: '#f1f5f9',
                            bodyColor: '#94a3b8',
                            titleFont: { family: 'Inter', size: 11, weight: '600' },
                            bodyFont: { family: 'Inter', size: 11 },
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            borderWidth: 1,
                            padding: 8,
                            displayColors: false,
                            cornerRadius: 4
                        }
                    }
                }
            });
        }

        // Render Hourly Chart
        if (hourlyCtx.current) {
            if (hourlyChart.current) hourlyChart.current.destroy();
            
            const ctx = hourlyCtx.current.getContext('2d');
            
            // Create bar gradient (emerald/teal SaaS vibe)
            const barGrad = ctx.createLinearGradient(0, 0, 0, 300);
            barGrad.addColorStop(0, 'rgba(16, 185, 129, 0.85)');
            barGrad.addColorStop(1, 'rgba(16, 185, 129, 0.15)');
            
            hourlyChart.current = new Chart(hourlyCtx.current, {
                type: 'bar',
                data: {
                    labels: Array.from({length: 24}, (_, i) => i + ':00'),
                    datasets: [{
                        label: 'Incidents',
                        data: Object.values(fullHourlyData),
                        backgroundColor: barGrad,
                        hoverBackgroundColor: '#34d399',
                        borderRadius: 5,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1200,
                        easing: 'easeOutQuart'
                    },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            border: { display: false },
                            ticks: { 
                                stepSize: 1, 
                                color: '#94a3b8', 
                                font: { family: 'Inter', size: 10, weight: '500' },
                                padding: 8
                            }, 
                            grid: { 
                                color: 'rgba(255, 255, 255, 0.04)',
                                borderDash: [4, 4],
                                drawTicks: false
                            } 
                        },
                        x: { 
                            border: { display: false },
                            ticks: { 
                                color: '#94a3b8', 
                                font: { family: 'Inter', size: 9, weight: '500' },
                                padding: 8
                            }, 
                            grid: { 
                                display: false 
                            } 
                        }
                    },
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#0b0f19',
                            titleColor: '#f1f5f9',
                            bodyColor: '#94a3b8',
                            titleFont: { family: 'Inter', size: 11, weight: '600' },
                            bodyFont: { family: 'Inter', size: 11 },
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            borderWidth: 1,
                            padding: 8,
                            displayColors: false,
                            cornerRadius: 4
                        }
                    }
                }
            });
        }

        return () => {
            if (trendChart.current) trendChart.current.destroy();
            if (hourlyChart.current) hourlyChart.current.destroy();
            if (typeChart.current) typeChart.current.destroy();
            if (statusChart.current) statusChart.current.destroy();
        };
    }, [liveWeekly, fullHourlyData, typeData, statusData]);

    // ─── Live Polling Engine ──────────────────────────────────────────────────
    useEffect(() => {
        const pollLiveStats = async () => {
            try {
                const res = await fetch('/dashboard/live-stats', {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
                });
                if (!res.ok) return;
                const data = await res.json();

                // Detect new incoming reports since last poll
                const prevIds = new Set(liveReports.map(r => r.id));
                const newReports = (data.latestReports || []).filter(r => !prevIds.has(r.id));

                if (newReports.length > 0) {
                    // Add new events to the live ticker
                    setTickerEvents(prev => [
                        ...newReports.map(r => ({
                            id: r.id,
                            title: r.title,
                            type: r.type,
                            priority: r.priority,
                            location: r.location,
                            time: dayjs(r.created_at).format('HH:mm:ss'),
                            isSimulated: r.is_simulated,
                        })),
                        ...prev,
                    ].slice(0, 12)); // Keep last 12 events
                }

                setLiveTotal(data.totalReports);
                setLiveMyReports(data.myReports);
                setLiveReports(data.latestReports || []);
                setLiveWeekly(data.weeklyTrend || initialWeeklyTrend);
                setLiveHourly(data.fullHourlyData || initialFullHourlyData);
                setLivePeakTime(data.peakTime || initialPeakTime);
                setLiveTrendDirection(data.trendDirection || initialTrendDirection);
                setLiveTrendPercent(data.trendPercent ?? initialTrendPercent);
                setLastUpdated(dayjs(data.timestamp).format('HH:mm:ss'));
                setIsLive(true);
            } catch (e) {
                // Silent fail — keeps old data visible
            }
        };

        // Store ref so sandbox actions can call it immediately
        pollLiveStatsRef.current = pollLiveStats;

        // Poll immediately then every 30 seconds
        pollLiveStats();
        const interval = setInterval(pollLiveStats, 30000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll ticker
    useEffect(() => {
        if (tickerRef.current) {
            tickerRef.current.scrollTop = 0;
        }
    }, [tickerEvents]);

    useEffect(() => {
        // Number Counter Animation
        const counters = document.querySelectorAll('.counter');
        const speed = 200;

        counters.forEach(counter => {
            const animate = () => {
                const value = +counter.getAttribute('data-target');
                const data = +counter.innerText;
                const time = value / speed;

                if (data < value) {
                    counter.innerText = Math.ceil(data + time);
                    setTimeout(animate, 1);
                } else {
                    counter.innerText = value;
                }
            };
            
            const observer = new IntersectionObserver((entries) => {
                if(entries[0].isIntersecting) animate();
            }, { threshold: 0.5 });
            
            observer.observe(counter);
            return () => observer.disconnect();
        });
    }, [totalReports, myReports]);

    return (
        <AppLayout header="Dashboard Overview">
            <Head title="Dashboard" />
            
            <style>
                {`
                .font-serif-custom { font-family: 'Merriweather', serif; }
                .reveal-on-scroll {
                    opacity: 0;
                    transform: translateY(8px);
                    transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .reveal-on-scroll.revealed {
                    opacity: 1;
                    transform: translateY(0);
                }
                @keyframes banner-glow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .banner-glow-flow {
                    background: linear-gradient(135deg, rgba(8, 12, 24, 0.45) 0%, rgba(20, 26, 46, 0.55) 50%, rgba(8, 12, 24, 0.45) 100%) !important;
                    background-size: 200% 200% !important;
                    animation: banner-glow 15s ease infinite !important;
                }
                /* Sonar Pulse Indicator Dot */
                .pulse-indicator-dot {
                    width: 6px;
                    height: 6px;
                    background-color: #10b981;
                    border-radius: 9999px;
                    display: inline-block;
                    position: relative;
                }
                .pulse-indicator-dot::before,
                .pulse-indicator-dot::after {
                    content: '';
                    position: absolute;
                    inset: -4px;
                    border-radius: 9999px;
                    border: 1.5px solid #10b981;
                    animation: sonar-pulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
                    pointer-events: none;
                    opacity: 0;
                }
                .pulse-indicator-dot::before {
                    animation-delay: 1s;
                }
                @keyframes sonar-pulse {
                    0% { transform: scale(0.7); opacity: 0.8; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
                `}
            </style>

            {/* Custom Welcome & Status Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 premium-card text-white p-6 rounded-2xl shadow-xl relative overflow-hidden mb-6 border border-slate-800/60 reveal-on-scroll banner-glow-flow">
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">
                        Neighborhood Operations Hub
                    </span>
                    <h2 className="text-2xl font-extrabold mt-1.5 tracking-tight text-slate-100 font-jakarta">Hello, {user.name} 👋</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                        Real-time community security logs, dispatch records, and incident reports for Sector 4B — North Heights.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 relative z-10 self-start md:self-auto flex-shrink-0">
                    <div className="flex items-center gap-2 bg-[#050912]/80 border border-slate-800/60 px-3.5 py-2 rounded-xl shadow-inner backdrop-blur">
                        <span className="pulse-indicator-dot relative"></span>
                        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">{isLive ? 'System Active' : 'Offline'}</span>
                    </div>
                    {lastUpdated && (
                        <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Last Sync: {lastUpdated}</span>
                    )}
                </div>
            </div>

            {/* Seed / Clear Demo Data Banner for Admins */}
            {user.role === 'admin' && (
                <>
                    {/* Inline status message */}
                    {sandboxMsg && (
                        <div className={`mb-4 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 reveal-on-scroll shadow-md ${
                            sandboxMsg.type === 'success'
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}>
                            {sandboxMsg.type === 'success' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                            {sandboxMsg.text}
                        </div>
                    )}

                    <div className={`border border-slate-800/80 text-white p-5 rounded-2xl shadow-xl mb-6 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-[#05080f]/60 backdrop-blur-xl ${totalReports === 0 ? 'border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.08)]' : ''}`}>
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10 flex-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-400 flex items-center gap-1.5">
                                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse"></span>
                                {totalReports === 0 ? 'Setup Required' : 'Incident Simulation Deck'}
                            </span>
                            <h3 className="text-base font-extrabold text-slate-100 tracking-tight mt-1 font-jakarta">
                                {totalReports === 0 ? 'Initialize Sandbox Environment' : 'Control Deck Operations'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
                                {totalReports === 0
                                    ? 'Populate this sector with mock incident reports and responder profiles to test the security maps, dispatch tracking, and live charts.'
                                    : 'Push a new simulated incident report instantly. The live feed, telemetry metrics, and analytics counters will dynamically sync.'}
                            </p>
                        </div>
                        <div className="relative z-10 flex flex-wrap gap-3">
                            {/* Seed Sample Data — premium indigo styling */}
                            <button
                                onClick={() => runSandboxAction('seed')}
                                disabled={sandboxLoading !== null}
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/30 cursor-pointer"
                            >
                                {sandboxLoading === 'seed' ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        Seeding Data...
                                    </>
                                ) : 'Seed Demo Data'}
                            </button>

                            {/* Push Incident — sleek hollow gradient look */}
                            <button
                                onClick={() => runSandboxAction('push')}
                                disabled={sandboxLoading !== null}
                                className="inline-flex items-center gap-2 bg-[#0c1322] hover:bg-[#121c33] text-indigo-400 hover:text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/20 cursor-pointer"
                            >
                                {sandboxLoading === 'push' ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        Pushing Log...
                                    </>
                                ) : 'Push Live Incident'}
                            </button>

                            {/* Clear Demo Data — warning hollow look */}
                            {totalReports > 0 && (
                                <button
                                    onClick={() => runSandboxAction('clear')}
                                    disabled={sandboxLoading !== null}
                                    className="inline-flex items-center gap-2 bg-[#1a0a0f] hover:bg-[#2d121b] text-red-400 hover:text-red-300 font-extrabold text-[10px] uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/20 cursor-pointer"
                                >
                                    {sandboxLoading === 'clear' ? (
                                        <>
                                            <svg className="animate-spin h-3.5 w-3.5 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                            Clearing Hub...
                                        </>
                                    ) : 'Clear Demo Data'}
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}



            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-on-scroll">
                    <div 
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="premium-card spotlight-card p-6 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-jakarta">Total Incidents</p>
                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-900 border border-slate-800/80 px-2 py-0.5 rounded-full font-jakarta">Sector Logs</span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-slate-100 mt-2.5 font-jakarta counter" data-target={totalReports}>0</h3>
                            </div>
                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-5 pt-3 border-t border-slate-900/60">
                            <Link href={route('reports.index')} className="text-[11px] font-extrabold text-indigo-400 hover:text-indigo-350 transition-colors flex items-center gap-1 uppercase tracking-wider font-jakarta">
                                View neighborhood map
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div 
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="premium-card spotlight-card p-6 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-jakarta">My Contributions</p>
                                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded-full font-jakarta">Active Guard</span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-slate-100 mt-2.5 font-jakarta counter" data-target={myReports}>0</h3>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-5 pt-3 border-t border-slate-900/60">
                            <Link href={route('reports.my-reports')} className="text-[11px] font-extrabold text-emerald-400 hover:text-emerald-350 transition-colors flex items-center gap-1 uppercase tracking-wider font-jakarta">
                                View my contribution list
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div 
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="premium-card spotlight-card p-6 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-jakarta">Verification Status</p>
                                    <span className="text-[9px] font-bold text-amber-400 bg-amber-950/30 border border-amber-900/40 px-2 py-0.5 rounded-full font-jakarta">Verified Resident</span>
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-100 mt-2.5 font-jakarta capitalize">{user.status}</h3>
                            </div>
                            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-5 pt-3 border-t border-slate-900/60">
                            <span className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1.5 uppercase tracking-wider font-jakarta">
                                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
                                Citizen Account Secure
                            </span>
                        </div>
                    </div>
                </div>

                {/* Safety Intelligence & Predictive Insights */}
                <div 
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="premium-card spotlight-card p-6 shadow-xl relative overflow-hidden border border-slate-800/60 reveal-on-scroll animate-fade-in"
                >
                    <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
                        <div className="flex-1 min-w-[300px]">
                            <h3 className="text-sm font-extrabold flex items-center gap-2 text-slate-200 font-jakarta uppercase tracking-wider">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Incident Analytics Telemetry
                            </h3>
                            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                                {totalReports === 0 ? (
                                    <>Telemetry sensors report 0 security incidents in Sector 4B. The sector perimeter is currently secure.</>
                                ) : (
                                    <>
                                        Tactical security telemetry indicates that <span className="text-indigo-400 font-extrabold">{peakTime}</span> is the peak timeframe for reports. 
                                        Sector perimeter safety is currently <span className={`font-black ${trendDirection === 'down' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {trendDirection === 'down' ? ' Improving ' : ' Declining '} 
                                        </span> 
                                        with a <span className="underline decoration-slate-850 font-semibold">{trendPercent}%</span> density shift compared to the previous cycle.
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-4 relative z-10 flex-shrink-0">
                            <div className="bg-[#05080e]/80 p-3.5 rounded-xl border border-slate-900/60 backdrop-blur shadow-inner">
                                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Peak Time</span>
                                <span className="text-sm font-extrabold text-indigo-400 mt-1 block font-jakarta">{peakTime}</span>
                            </div>
                            <div className="bg-[#05080e]/80 p-3.5 rounded-xl border border-slate-900/60 backdrop-blur shadow-inner">
                                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Trend</span>
                                <span className={`text-sm font-extrabold mt-1 block font-jakarta ${trendDirection === 'stable' ? 'text-emerald-400' : (trendDirection === 'down' ? 'text-emerald-400' : 'text-amber-400')}`}>
                                    {trendDirection === 'stable' ? 'Stable' : (
                                        `${trendDirection === 'down' ? '↓' : '↑'} ${trendPercent}%`
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 reveal-on-scroll">
                    {/* Weekly Trends Chart */}
                    <div 
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="glass-panel spotlight-card p-5 shadow-sm border border-slate-800/80"
                    >
                        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <span className="h-3 w-1 bg-emerald-500 rounded-full"></span>
                            7-Day Incident Trend
                        </h3>
                        <div className="relative h-60 w-full">
                            <canvas ref={trendCtx}></canvas>
                        </div>
                    </div>

                    {/* Hourly Distribution Chart */}
                    <div 
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="glass-panel spotlight-card p-5 shadow-sm border border-slate-800/80"
                    >
                        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <span className="h-3 w-1 bg-indigo-500 rounded-full"></span>
                            Hourly Activity Distribution
                        </h3>
                        <div className="relative h-60 w-full">
                            <canvas ref={hourlyCtx}></canvas>
                        </div>
                    </div>
                </div>

                {/* Bottom: Recent Feed + Live Ticker */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 reveal-on-scroll">
                    {/* Recent Reports Preview — 2/3 width */}
                    <div 
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="lg:col-span-2 premium-card spotlight-card overflow-hidden flex flex-col"
                    >
                        {/* Panel Header */}
                        <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider font-jakarta">Incident Log</h3>
                                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Community Reports Feed</p>
                                </div>
                            </div>
                            <Link href={route('reports.index')} className="text-[10px] font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 uppercase tracking-wider border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg">
                                View All
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Report Rows */}
                        <div className="flex-1 divide-y divide-white/[0.03]">
                            {latestReports && latestReports.length > 0 ? (
                                latestReports.map((report, idx) => {
                                    const typeColor = report.type === 'crime' ? { bar: 'bg-red-500', icon: 'bg-red-500/10 text-red-400 border-red-500/20', badge: 'bg-red-500/10 text-red-400 border-red-500/20' }
                                        : report.type === 'accident' ? { bar: 'bg-amber-500', icon: 'bg-amber-500/10 text-amber-400 border-amber-500/20', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
                                        : report.type === 'suspicious' ? { bar: 'bg-indigo-500', icon: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' }
                                        : { bar: 'bg-slate-600', icon: 'bg-slate-800/60 text-slate-400 border-slate-700/40', badge: 'bg-slate-800/60 text-slate-400 border-slate-700/40' };
                                    const emoji = report.type === 'crime' ? '🔴' : report.type === 'accident' ? '⚠️' : report.type === 'suspicious' ? '🔍' : '📝';
                                    return (
                                        <div key={report.id} className="group px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors duration-150 cursor-pointer">
                                            {/* Color accent bar */}
                                            <div className={`self-stretch w-0.5 ${typeColor.bar} rounded-full flex-shrink-0 opacity-80`}></div>

                                            {/* Icon */}
                                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 border text-sm ${typeColor.icon}`}>
                                                {emoji}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3">
                                                    <h4 className="font-semibold text-slate-200 text-sm group-hover:text-indigo-300 transition-colors truncate leading-snug">
                                                        <Link href={route('reports.show', report.id)}>{report.title}</Link>
                                                    </h4>
                                                    <span className="text-[9px] font-mono text-slate-600 bg-[#060a14] px-2 py-0.5 rounded border border-slate-800/60 flex-shrink-0 mt-0.5">
                                                        INC-{String(report.id).padStart(4, '0')}
                                                    </span>
                                                </div>
                                                <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${typeColor.badge}`}>
                                                        {report.type}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        </svg>
                                                        {report.location}
                                                    </span>
                                                    <span className="text-[10px] text-slate-600 flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {dayjs(report.created_at).fromNow()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-10 text-center">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-900/60 border border-slate-800/40 flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-600 text-xs font-mono uppercase tracking-wider">No incidents logged</p>
                                    <p className="text-slate-700 text-[10px] mt-1">Sector is currently all-clear</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-white/[0.03] flex items-center justify-between">
                            <span className="text-[9px] text-slate-600 font-mono uppercase tracking-wider">Showing {Math.min(latestReports?.length || 0, 10)} of {totalReports} total</span>
                            <Link href={route('reports.create')} className="text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                New Report
                            </Link>
                        </div>
                    </div>

                    {/* Live Ticker Feed — 1/3 width */}
                    <div 
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="premium-card spotlight-card overflow-hidden flex flex-col"
                    >
                        {/* Panel Header */}
                        <div className="px-4 py-4 border-b border-white/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="relative flex-shrink-0">
                                    <span className="pulse-indicator-dot"></span>
                                </div>
                                <div>
                                    <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider font-jakarta">Live Feed</h3>
                                    <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">Real-time Event Log</p>
                                </div>
                            </div>
                            <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg border ${isLive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800/60 text-slate-500 border-slate-700/30'}`}>
                                {isLive ? '● Live' : '○ Offline'}
                            </span>
                        </div>

                        {/* Ticker Events */}
                        <div ref={tickerRef} className="flex-1 overflow-y-auto max-h-[380px] custom-scrollbar divide-y divide-white/[0.03]">
                            {tickerEvents.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-900/60 border border-slate-800/40 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9 10a3 3 0 116 0 3 3 0 01-6 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-slate-600 text-[10px] font-mono tracking-wider uppercase">Monitoring active</div>
                                        <div className="text-slate-700 text-[9px] mt-0.5">Awaiting new incidents...</div>
                                    </div>
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="h-1 w-1 bg-slate-700 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                tickerEvents.map((ev, i) => (
                                    <div key={`${ev.id}-${i}`} className="group px-4 py-3 flex items-start gap-3 hover:bg-white/[0.015] transition-colors duration-150 incident-entry-animate">
                                        {/* Priority dot */}
                                        <div className="flex-shrink-0 mt-1">
                                            <div className={`h-1.5 w-1.5 rounded-full ${
                                                ev.priority === 'critical' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]' :
                                                ev.priority === 'high'     ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]' :
                                                ev.priority === 'medium'   ? 'bg-blue-500' :
                                                                             'bg-slate-600'
                                            }`}></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {/* Priority + type badges */}
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                                    ev.priority === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    ev.priority === 'high'     ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    ev.priority === 'medium'   ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                                 'bg-slate-800/60 text-slate-500 border-slate-700/30'
                                                }`}>{ev.priority || 'low'}</span>
                                                {ev.type && (
                                                    <span className="text-[7px] font-bold text-slate-600 uppercase tracking-wider">{ev.type}</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-300 font-medium leading-snug line-clamp-2">{ev.title}</p>
                                            <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono">
                                                <span className="text-slate-600">INC-{String(ev.id).padStart(4, '0')}</span>
                                                <span className="text-slate-600">{ev.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-white/[0.03] flex items-center justify-between bg-[#030609]/20">
                            <span className="text-[9px] text-slate-700 font-mono uppercase tracking-wider">Auto-refresh: 30s</span>
                            <div className="flex gap-1">
                                <div className="h-1 w-1 rounded-full bg-indigo-500/50 animate-pulse"></div>
                                <div className="h-1 w-1 rounded-full bg-indigo-500/30 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                                <div className="h-1 w-1 rounded-full bg-indigo-500/20 animate-pulse" style={{animationDelay: '0.6s'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

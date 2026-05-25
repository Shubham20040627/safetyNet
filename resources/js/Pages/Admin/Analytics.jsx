import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import Chart from 'chart.js/auto';

// Simple animated counter component with cubic ease-out curve
const AnimatedCounter = ({ value, duration = 1200 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const end = parseInt(value, 10);
        if (isNaN(end) || end === 0) {
            setCount(0);
            return;
        }

        let startTime = null;
        let animationFrameId;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Ease-out cubic formula
            const easeOutCubic = 1 - Math.pow(1 - percentage, 3);
            
            setCount(Math.floor(easeOutCubic * end));

            if (percentage < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [value, duration]);

    return <span>{count}</span>;
};

export default function Analytics({
    totalIncidents,
    unresolvedIncidents,
    resolvedIncidents,
    avgResolutionTime,
    typeData,
    priorityData,
    fullHourlyData,
    weeklyData,
    forecastData
}) {
    const trendCanvas = useRef(null);
    const categoryCanvas = useRef(null);
    const hourlyPolarCanvas = useRef(null);
    const priorityCanvas = useRef(null);

    const trendChartRef = useRef(null);
    const categoryChartRef = useRef(null);
    const hourlyPolarChartRef = useRef(null);
    const priorityChartRef = useRef(null);

    // Calculate Peak Hour
    const maxHourVal = Math.max(...Object.values(fullHourlyData));
    const peakHour = Object.keys(fullHourlyData).find(key => fullHourlyData[key] === maxHourVal) || 0;
    
    // Format Peak Time
    const getFormattedPeakTime = (hour) => {
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour} ${ampm}`;
    };
    const peakTime = getFormattedPeakTime(peakHour);

    // Compute Safety Index in main body for animated gauge dial
    const criticalVal = priorityData.critical || 0;
    const highVal = priorityData.high || 0;
    const mediumVal = priorityData.medium || 0;
    const resolvedVal = resolvedIncidents || 0;
    
    const safetyIndex = Math.max(0, Math.min(100, Math.round(
        100 - ((15 * criticalVal + 10 * highVal + 5 * mediumVal) / (1 + resolvedVal))
    )));

    const responseVelocity = avgResolutionTime > 0 ? parseFloat((1 / avgResolutionTime).toFixed(2)) : 0;

    const [gaugeOffset, setGaugeOffset] = useState(125.6);
    useEffect(() => {
        const timer = setTimeout(() => {
            setGaugeOffset(125.6 - (125.6 * safetyIndex) / 100);
        }, 150);
        return () => clearTimeout(timer);
    }, [safetyIndex]);

    // Advice text
    let advice = "";
    let adviceTheme = "";
    if (unresolvedIncidents > 5) {
        advice = `CRITICAL ADVISORY: Active response dispatch queue is overloaded (+${unresolvedIncidents} unresolved reports). Prioritize dispatching active responders immediately to incident zones.`;
        adviceTheme = 'text-red-400';
    } else if (parseInt(peakHour, 10) >= 20 || parseInt(peakHour, 10) <= 4) {
        advice = `NIGHT-OPS SECURITY PROTOCOL: Calculated threat density peaks during the late-night hours around ${peakTime}. It is highly recommended to schedule responder foot patrols and focus safety lighting during this window.`;
        adviceTheme = 'text-indigo-300';
    } else {
        advice = `STANDARD OPERATIONS: Community threat levels are stable. Dispatch efficiency is currently averaging ${avgResolutionTime} hours. Maintain active vigilance programs.`;
        adviceTheme = 'text-emerald-400';
    }

    useEffect(() => {
        // --- 1. Weekly Safety Trend Chart ---
        if (trendCanvas.current) {
            const labels = Object.keys(weeklyData);
            const values = Object.values(weeklyData);

            const lastDateStr = labels.length > 0 ? labels[labels.length - 1] : new Date().toISOString().split('T')[0];
            const forecastLabels = [];
            const lastDate = new Date(lastDateStr);
            for (let i = 1; i <= 3; i++) {
                const nextDate = new Date(lastDate);
                nextDate.setDate(lastDate.getDate() + i);
                forecastLabels.push(nextDate.toISOString().split('T')[0]);
            }

            const allLabels = [...labels, ...forecastLabels];
            const paddedValues = [...values, ...Array(3).fill(null)];
            const forecastValues = values.length > 0
                ? [...Array(values.length - 1).fill(null), values[values.length - 1], ...forecastData]
                : [...forecastData];

            if (trendChartRef.current) trendChartRef.current.destroy();

            trendChartRef.current = new Chart(trendCanvas.current, {
                type: 'line',
                data: {
                    labels: allLabels,
                    datasets: [
                        {
                            label: 'Actual Reports',
                            data: paddedValues,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3,
                            pointBackgroundColor: '#10b981',
                            pointBorderColor: '#090f1e',
                            pointBorderWidth: 2,
                            pointRadius: 5
                        },
                        {
                            label: 'AI Forecasted Trend',
                            data: forecastValues,
                            borderColor: '#6366f1',
                            borderDash: [6, 6],
                            backgroundColor: 'rgba(99, 102, 241, 0.05)',
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3,
                            pointBackgroundColor: '#6366f1',
                            pointBorderColor: '#090f1e',
                            pointBorderWidth: 2,
                            pointRadius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#94a3b8', font: { weight: '600' } },
                            grid: { color: 'rgba(30, 41, 59, 0.4)' }
                        },
                        x: {
                            ticks: { color: '#94a3b8', font: { weight: '600', size: 10 } },
                            grid: { display: false }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { family: 'Inter', size: 11, weight: '600' },
                                color: '#94a3b8'
                            }
                        }
                    }
                }
            });
        }

        // --- 2. Category Doughnut Chart ---
        if (categoryCanvas.current) {
            if (categoryChartRef.current) categoryChartRef.current.destroy();

            categoryChartRef.current = new Chart(categoryCanvas.current, {
                type: 'doughnut',
                data: {
                    labels: ['Crime', 'Accident', 'Suspicious', 'Other'],
                    datasets: [{
                        data: [
                            typeData.crime || 0,
                            typeData.accident || 0,
                            typeData.suspicious || 0,
                            typeData.other || 0
                        ],
                        backgroundColor: ['#ef4444', '#f59e0b', '#6366f1', '#475569'],
                        borderWidth: 2,
                        borderColor: '#090f1e',
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { family: 'Inter', size: 10, weight: '600' },
                                color: '#94a3b8'
                            }
                        }
                    }
                }
            });
        }

        // --- 3. Hourly Polar Area Chart ---
        if (hourlyPolarCanvas.current) {
            const blockLabels = ['Night (12am-6am)', 'Morning (6am-12pm)', 'Afternoon (12pm-6pm)', 'Evening (6pm-12am)'];
            const blockValues = [0, 0, 0, 0];

            for (let i = 0; i < 24; i++) {
                const count = fullHourlyData[i] || 0;
                if (i >= 0 && i < 6) blockValues[0] += count;
                else if (i >= 6 && i < 12) blockValues[1] += count;
                else if (i >= 12 && i < 18) blockValues[2] += count;
                else blockValues[3] += count;
            }

            if (hourlyPolarChartRef.current) hourlyPolarChartRef.current.destroy();

            hourlyPolarChartRef.current = new Chart(hourlyPolarCanvas.current, {
                type: 'polarArea',
                data: {
                    labels: blockLabels,
                    datasets: [{
                        data: blockValues,
                        backgroundColor: [
                            'rgba(99, 102, 241, 0.75)',
                            'rgba(16, 185, 129, 0.75)',
                            'rgba(245, 158, 11, 0.75)',
                            'rgba(239, 68, 68, 0.75)'
                        ],
                        borderWidth: 1,
                        borderColor: '#090f1e'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            grid: { color: 'rgba(30, 41, 59, 0.4)' },
                            ticks: { color: '#94a3b8', font: { weight: '600' }, backdropColor: 'transparent' }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { family: 'Inter', size: 10, weight: '600' },
                                color: '#94a3b8'
                            }
                        }
                    }
                }
            });
        }

        // --- 4. Priority Chart ---
        if (priorityCanvas.current) {
            if (priorityChartRef.current) priorityChartRef.current.destroy();

            priorityChartRef.current = new Chart(priorityCanvas.current, {
                type: 'bar',
                data: {
                    labels: ['Low', 'Medium', 'High', 'Critical'],
                    datasets: [{
                        label: 'Reports',
                        data: [
                            priorityData.low || 0,
                            priorityData.medium || 0,
                            priorityData.high || 0,
                            priorityData.critical || 0
                        ],
                        backgroundColor: ['#475569', '#3b82f6', '#f59e0b', '#ef4444'],
                        borderRadius: 8,
                        maxBarThickness: 35
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, color: '#94a3b8', font: { weight: '600' } },
                            grid: { color: 'rgba(30, 41, 59, 0.4)' }
                        },
                        x: {
                            ticks: { color: '#94a3b8', font: { weight: '600' } },
                            grid: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        return () => {
            if (trendChartRef.current) trendChartRef.current.destroy();
            if (categoryChartRef.current) categoryChartRef.current.destroy();
            if (hourlyPolarChartRef.current) hourlyPolarChartRef.current.destroy();
            if (priorityChartRef.current) priorityChartRef.current.destroy();
        };
    }, [weeklyData, forecastData, typeData, fullHourlyData, priorityData]);

    return (
        <AppLayout header="Security Analytics Panel">
            <Head title="Security Analytics Panel" />
            
            <style>
                {`
                .font-serif-custom { font-family: 'Merriweather', serif; }
                .glass-card {
                    background: rgba(15, 23, 42, 0.65);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(30, 41, 59, 0.8);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .glass-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(99, 102, 241, 0.4);
                    box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.6), 0 0 20px -2px rgba(99, 102, 241, 0.1);
                }
                @keyframes fade-up-slide {
                    0% { opacity: 0; transform: translateY(12px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .staggered-card {
                    opacity: 0;
                    animation: fade-up-slide 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                `}
            </style>

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-2xl shadow-lg border border-slate-800 relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Security Operations Command</span>
                        <h2 className="text-3xl font-black font-serif-custom mt-1">Intelligence Dashboard</h2>
                        <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">AI-enhanced neighborhood security analytics, resolution times, and safety trend projections.</p>
                    </div>
                    <div className="flex items-center gap-2.5 bg-indigo-500/10 backdrop-blur border border-indigo-500/30 px-4 py-2.5 rounded-xl relative z-10 self-start md:self-auto">
                        <span className="h-2.5 w-2.5 bg-indigo-400 rounded-full animate-ping"></span>
                        <span className="text-xs font-black text-indigo-200 uppercase tracking-widest">AI Engine Active</span>
                    </div>
                    <div className="absolute -right-12 -top-12 w-44 h-44 bg-indigo-600/10 rounded-full filter blur-xl"></div>
                    <div className="absolute -left-12 -bottom-12 w-44 h-44 bg-slate-700/10 rounded-full filter blur-xl"></div>
                </div>

                {/* Mathematical Analytics Spotlight: Safety Index & Response Velocity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Speedometer Gauge Dial Card */}
                    <div className="glass-card p-6 rounded-2xl shadow-lg border border-slate-800/80 flex flex-col items-center justify-between text-center relative overflow-hidden group staggered-card" style={{ animationDelay: '0ms' }}>
                        <div className="absolute top-0 right-0 p-3 text-[10px] font-black text-indigo-500/40 uppercase tracking-widest">Index Dial</div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest self-start">Neighborhood Safety Index</h4>
                        <div className="my-6 relative w-full flex items-center justify-center">
                            <svg viewBox="0 0 100 55" className="w-full max-w-[200px] drop-shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gaugeGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={gaugeOffset} className="transition-all duration-1000 ease-out" />
                              <defs>
                                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#ef4444" />
                                  <stop offset="50%" stopColor="#f59e0b" />
                                  <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                              </defs>
                              <text x="50" y="45" textAnchor="middle" className="fill-white text-lg font-black font-serif-custom">{safetyIndex}%</text>
                            </svg>
                        </div>
                        <div className="text-xs text-slate-400 leading-relaxed font-semibold">
                            Status: <span className={`font-black ${safetyIndex >= 80 ? 'text-emerald-400' : safetyIndex >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                {safetyIndex >= 80 ? 'SECURE SECTOR' : safetyIndex >= 50 ? 'ELEVATED RISK' : 'CRITICAL THREAT LEVEL'}
                            </span>
                        </div>
                    </div>

                    {/* Response Speed Efficiency Card */}
                    <div className="glass-card p-6 rounded-2xl shadow-lg border border-slate-800/80 flex flex-col justify-between relative overflow-hidden group staggered-card" style={{ animationDelay: '100ms' }}>
                        <div className="absolute top-0 right-0 p-3 text-[10px] font-black text-indigo-500/40 uppercase tracking-widest">Velocity Rate</div>
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Dispatch Resolution Velocity</h4>
                            <div className="mt-5 flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white font-serif-custom tracking-tight">{responseVelocity}</span>
                                <span className="text-xs font-bold text-slate-400">cases / hr</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                                Measures completed community reports against average operations turnaround duration. Higher is better.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>Scale Target: &gt; 0.50</span>
                            <span className={responseVelocity >= 0.5 ? "text-emerald-400" : "text-amber-400"}>
                                {responseVelocity >= 0.5 ? "Optimal" : "Sub-Optimal"}
                            </span>
                        </div>
                    </div>

                    {/* Equation Proof / Live Operations Spec */}
                    <div className="glass-card p-6 rounded-2xl shadow-lg border border-slate-800/80 flex flex-col justify-between relative overflow-hidden group staggered-card" style={{ animationDelay: '200ms' }}>
                        <div className="absolute top-0 right-0 p-3 text-[10px] font-black text-indigo-500/40 uppercase tracking-widest">Operations Math</div>
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Safety Coefficient Spec</h4>
                            <div className="mt-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-indigo-300 space-y-1.5 leading-relaxed">
                                <div className="text-slate-400">// Calculated Coefficient Formula:</div>
                                <div>S_i = max(0, 100 - (15*C + 10*H + 5*M) / (1 + R))</div>
                                <div className="pt-1.5 border-t border-slate-800/80 text-slate-400">// Current Sector Values:</div>
                                <div>C (Critical): {criticalVal} | H (High): {highVal}</div>
                                <div>M (Medium): {mediumVal} | R (Resolved): {resolvedVal}</div>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-2">
                            * Weighting penalizes active critical emergencies severely while resolved cases offset sector threat level.
                        </span>
                    </div>
                </div>

                {/* Analytics Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 7-Day Safety Trend & AI Forecast */}
                    <div className="lg:col-span-8 glass-card p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-black text-indigo-100 font-serif-custom mb-6 flex items-center gap-2">
                            <span className="h-3.5 w-1.5 bg-emerald-500 rounded-full"></span>
                            Safety Trend & AI Threat Forecast
                        </h3>
                        <div className="relative h-80 w-full">
                            <canvas ref={trendCanvas}></canvas>
                        </div>
                    </div>

                    {/* Incident Category (Doughnut) */}
                    <div className="lg:col-span-4 glass-card p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                        <h3 className="text-lg font-black text-indigo-100 font-serif-custom mb-6 flex items-center gap-2">
                            <span className="h-3.5 w-1.5 bg-indigo-500 rounded-full"></span>
                            Incident Categories
                        </h3>
                        <div className="relative h-60 w-full flex items-center justify-center">
                            <canvas ref={categoryCanvas}></canvas>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
                            <div>
                                <span className="block font-bold text-red-400">{typeData.crime || 0}</span>
                                <span className="text-[9px] font-black uppercase text-slate-500">Crimes</span>
                            </div>
                            <div>
                                <span className="block font-bold text-indigo-400">{typeData.suspicious || 0}</span>
                                <span className="text-[9px] font-black uppercase text-slate-500">Suspicious</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clock Hour Grid and Incident Priority Chart Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Polar Clock Danger Distribution */}
                    <div className="glass-card p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-black text-indigo-100 font-serif-custom mb-6 flex items-center gap-2">
                            <span className="h-3.5 w-1.5 bg-amber-500 rounded-full"></span>
                            Danger Density by Hourly Blocks
                        </h3>
                        <div className="relative h-80 w-full flex items-center justify-center">
                            <canvas ref={hourlyPolarCanvas}></canvas>
                        </div>
                    </div>

                    {/* Priority Stacked Bars */}
                    <div className="glass-card p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-black text-indigo-100 font-serif-custom mb-6 flex items-center gap-2">
                            <span className="h-3.5 w-1.5 bg-red-500 rounded-full"></span>
                            Threat Level Priorities
                        </h3>
                        <div className="relative h-80 w-full flex items-center justify-center">
                            <canvas ref={priorityCanvas}></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Dashboard({
    totalAdmins,
    approvedAdmins,
    pendingRequests,
    rejectedRequests,
    admins
}) {
    const { post, delete: destroy, processing } = useForm();
    const { env } = usePage().props;
    const [selectedBoundary, setSelectedBoundary] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const mapContainer = useRef(null);
    const mapRef = useRef(null);

    const handleAction = (e, routeName, adminId) => {
        e.preventDefault();
        post(route(routeName, adminId));
    };

    const handleDelete = (e, adminName, adminId) => {
        e.preventDefault();
        if (window.confirm(`Are you absolutely sure you want to permanently erase the Moderator account for '${adminName}'? This action is irreversible.`)) {
            destroy(route('superadmin.delete', adminId));
        }
    };

    const handleResetSOS = (e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to force resolve and clear all active neighborhood SOS emergency alerts?')) {
            post(route('superadmin.reset-sos'));
        }
    };

    const openBoundaryModal = (admin) => {
        setSelectedBoundary(admin);
        setModalOpen(true);
    };

    const closeBoundaryModal = () => {
        setModalOpen(false);
        setSelectedBoundary(null);
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };

    useEffect(() => {
        if (modalOpen && selectedBoundary && selectedBoundary.neighborhood_boundary) {
            const loadMapLibre = async () => {
                if (!window.maplibregl) {
                    await new Promise((resolve) => {
                        const script = document.createElement('script');
                        script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
                        script.onload = resolve;
                        document.head.appendChild(script);
                        
                        const link = document.createElement('link');
                        link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
                        link.rel = 'stylesheet';
                        document.head.appendChild(link);
                    });
                }
                setTimeout(() => {
                    initModalMap();
                }, 200);
            };
            loadMapLibre();
        }
    }, [modalOpen, selectedBoundary]);

    const initModalMap = () => {
        if (!mapContainer.current || !selectedBoundary) return;

        try {
            const geojson = JSON.parse(selectedBoundary.neighborhood_boundary);
            
            const maptilerKey = env?.maptilerKey || import.meta.env.VITE_MAPTILER_KEY || 'cE27yWwG20q9Z14q8T1o';
            
            const lat = parseFloat(selectedBoundary.neighborhood_lat) || 28.6139;
            const lng = parseFloat(selectedBoundary.neighborhood_lng) || 77.2090;

            const map = new window.maplibregl.Map({
                container: mapContainer.current,
                style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${maptilerKey}`,
                center: [lng, lat],
                zoom: 12
            });

            mapRef.current = map;
            map.addControl(new window.maplibregl.NavigationControl());

            map.on('load', () => {
                map.resize();
                
                map.addSource('boundary-source', {
                    type: 'geojson',
                    data: geojson
                });

                map.addLayer({
                    id: 'boundary-layer',
                    type: 'fill',
                    source: 'boundary-source',
                    paint: {
                        'fill-color': '#6366f1',
                        'fill-opacity': 0.15
                    }
                });

                map.addLayer({
                    id: 'boundary-outline',
                    type: 'line',
                    source: 'boundary-source',
                    paint: {
                        'line-color': '#4f46e5',
                        'line-width': 3
                    }
                });

                // Zoom to fits coordinates
                const coordinates = geojson.features[0].geometry.coordinates[0];
                const bounds = coordinates.reduce((bounds, coord) => {
                    return bounds.extend(coord);
                }, new window.maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

                map.fitBounds(bounds, {
                    padding: 40,
                    maxZoom: 16
                });
            });

        } catch (e) {
            console.error("Error drawing boundary map", e);
        }
    };

    return (
        <AppLayout header="Super Admin Dashboard">
            <Head title="Super Admin Dashboard" />
            
            <style>
                {`
                .glass-card {
                    background: rgba(15, 23, 42, 0.65);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(30, 41, 59, 0.8);
                }
                `}
            </style>

            <div className="container mx-auto">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-900/50 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
                            🛡️ Master Control Center
                        </div>
                        <h1 className="text-3xl font-black font-serif-custom text-indigo-100 leading-tight">Super Admin Dashboard</h1>
                        <p className="text-slate-400 mt-1">Oversee, authorize, and moderate neighborhood administrative nodes.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Master SOS Reset */}
                        <form onSubmit={handleResetSOS} className="inline m-0 p-0">
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-rose-450 bg-rose-955/35 hover:bg-rose-955/55 rounded-xl border border-rose-900/50 transition duration-150 shadow-[0_0_15px_rgba(244,63,94,0.15)] cursor-pointer"
                            >
                                🚨 Reset Active SOS Signals
                            </button>
                        </form>
                        <div className="flex items-center gap-2.5">
                            <span className="inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 animate-ping"></span>
                            <span className="text-sm font-bold text-slate-400">System Secure & Online</span>
                        </div>
                    </div>
                </div>

                {/* Statistics Overview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {/* Stat Card 1: Total Admins */}
                    <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-950 text-indigo-400 border border-slate-800 rounded-xl flex items-center justify-center shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Admin Nodes</span>
                            <span className="text-2xl font-black text-white">{totalAdmins}</span>
                        </div>
                    </div>

                    {/* Stat Card 2: Approved Admins */}
                    <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 bg-emerald-950/60 text-emerald-450 border border-emerald-900/50 rounded-xl flex items-center justify-center shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Admins</span>
                            <span className="text-2xl font-black text-white">{approvedAdmins}</span>
                        </div>
                    </div>

                    {/* Stat Card 3: Pending Requests */}
                    <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md border transition-all ${pendingRequests > 0 ? 'bg-amber-955/60 text-amber-450 border-amber-900/50 animate-pulse' : 'bg-slate-950 text-slate-650 border-slate-900'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pending Actions</span>
                            <span className="text-2xl font-black text-white">{pendingRequests}</span>
                        </div>
                    </div>

                    {/* Stat Card 4: Rejected Admins */}
                    <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 bg-rose-955/60 text-rose-450 border border-rose-900/50 rounded-xl flex items-center justify-center shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Suspended Nodes</span>
                            <span className="text-2xl font-black text-white">{rejectedRequests}</span>
                        </div>
                    </div>
                </div>

                {/* Admins Management Table */}
                <div className="glass-card rounded-2xl shadow-xl overflow-hidden overflow-x-auto">
                    <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40">
                        <div>
                            <h3 className="text-lg font-bold text-indigo-100 font-serif-custom">Neighborhood Administrators</h3>
                            <p className="text-xs text-slate-400">View, moderate, and adjust credentials of active or pending moderators.</p>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-400 font-bold shadow-sm">
                            <span>Total Registered: <strong className="text-indigo-400">{admins.length}</strong></span>
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse min-w-[950px]">
                        <thead>
                            <tr class="bg-slate-900/60 border-b border-slate-800/80">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Admin Name</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Contact Details</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Claimed Neighborhood</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Registered Date</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Access Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Moderator Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                            {admins.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span className="text-sm font-bold text-slate-400 block">No Registered Admins Found</span>
                                            <span className="text-xs text-slate-500 mt-1">When new local authorities register at `/admin/register`, they will show up here.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-900/30 transition">
                                        {/* Admin Name */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-950/60 border border-indigo-900/50 text-indigo-400 flex items-center justify-center font-bold text-sm shadow-inner uppercase">
                                                    {admin.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block font-serif-custom">{admin.name}</span>
                                                    <span className="text-xs text-slate-500 font-mono">ID: #{admin.id}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email Contact */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-slate-300 block">{admin.email}</span>
                                            <span className="text-xs text-slate-500 uppercase tracking-widest font-black text-[9px]">Neighborhood Authority</span>
                                        </td>

                                        {/* Claimed Neighborhood */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {admin.neighborhood_name ? (
                                                <>
                                                    <span className="text-sm font-bold text-slate-200 block">🏡 {admin.neighborhood_name}</span>
                                                    <span className="text-xs text-slate-500 font-semibold font-mono block">📍 {admin.neighborhood_lat}, {admin.neighborhood_lng}</span>
                                                    {admin.neighborhood_boundary && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => openBoundaryModal(admin)}
                                                            className="mt-1.5 px-2.5 py-0.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-400 rounded-lg text-[10px] font-black transition-all flex items-center gap-0.5 border border-indigo-900/50 shadow-sm w-fit uppercase tracking-wider cursor-pointer"
                                                        >
                                                            🗺️ View Region
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-500 italic">None Claimed</span>
                                            )}
                                        </td>

                                        {/* Registered Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-semibold">
                                            {admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : ''}
                                            <span className="text-xs text-slate-550 block font-normal">
                                                {admin.created_at ? new Date(admin.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {admin.status === 'approved' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 shadow-sm">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                                    Active Approved
                                                </span>
                                            )}
                                            {admin.status === 'pending' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/60 text-amber-400 border border-amber-900/50 shadow-sm animate-pulse">
                                                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                                    Awaiting Review
                                                </span>
                                            )}
                                            {admin.status === 'rejected' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-955/60 text-rose-450 border border-rose-900/50 shadow-sm">
                                                    <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                                                    Suspended Nodes
                                                </span>
                                            )}
                                        </td>

                                        {/* Moderator Action Controls */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Approve Button */}
                                                {admin.status !== 'approved' && (
                                                    <form onSubmit={(e) => handleAction(e, 'superadmin.approve', admin.id)} className="inline">
                                                        <button 
                                                            type="submit" 
                                                            className="p-2 rounded-xl bg-emerald-955/40 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-900/40 transition-all shadow-sm hover:shadow-md cursor-pointer"
                                                            title="Approve Moderator Access"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </button>
                                                    </form>
                                                )}

                                                {/* Reject Button */}
                                                {admin.status !== 'rejected' && (
                                                    <form onSubmit={(e) => handleAction(e, 'superadmin.reject', admin.id)} className="inline">
                                                        <button 
                                                            type="submit" 
                                                            className="p-2 rounded-xl bg-amber-955/40 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-900/40 transition-all shadow-sm hover:shadow-md cursor-pointer"
                                                            title="Suspend/Reject Access"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                            </svg>
                                                        </button>
                                                    </form>
                                                )}

                                                {/* Delete Button */}
                                                <form onSubmit={(e) => handleDelete(e, admin.name, admin.id)} className="inline">
                                                    <button 
                                                        type="submit" 
                                                        className="p-2 rounded-xl bg-rose-955/40 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-900/40 transition-all shadow-sm hover:shadow-md cursor-pointer"
                                                        title="Permanently Delete Account"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Map Boundary Viewer Modal */}
            {modalOpen && selectedBoundary && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
                    <div className="glass-card rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-indigo-100 font-serif-custom">🏡 {selectedBoundary.neighborhood_name} Boundary</h3>
                                <p className="text-xs text-slate-400">Exact geo-spatial territory claim of this moderator.</p>
                            </div>
                            <button onClick={closeBoundaryModal} className="p-2 rounded-xl hover:bg-slate-805 text-slate-400 hover:text-slate-200 transition cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {/* Map Canvas */}
                        <div className="relative">
                            <div ref={mapContainer} className="w-full h-96"></div>
                        </div>
                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800/80 flex justify-end">
                            <button onClick={closeBoundaryModal} className="px-4 py-2 bg-indigo-650/30 hover:bg-indigo-650/50 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)] text-indigo-400 rounded-xl font-bold text-xs transition cursor-pointer">
                                Done Viewing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

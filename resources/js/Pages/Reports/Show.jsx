import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';

export default function Show({ report }) {
    const { auth, env } = usePage().props;
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const { post: postResolve } = useForm();
    const { post: postVolunteer } = useForm();
    const [is3D, setIs3D] = useState(true);

    const toggle3D = () => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        if (is3D) {
            map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
            setIs3D(false);
        } else {
            map.easeTo({ pitch: 55, bearing: -15, duration: 1000 });
            setIs3D(true);
        }
    };

    const handleResolve = (e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to mark this incident as resolved?')) {
            postResolve(route('reports.resolve-assigned', report.id));
        }
    };

    const handleVolunteer = (e) => {
        e.preventDefault();
        postVolunteer(route('reports.volunteer', report.id));
    };

    useEffect(() => {
        if (!report.latitude || !report.longitude) return;

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
            initMap();
        };

        if (mapContainer.current) {
            loadMapLibre();
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [report.latitude, report.longitude]);

    const initMap = () => {
        if (mapRef.current) return;
        
        const lat = parseFloat(report.latitude);
        const lng = parseFloat(report.longitude);

        const maptilerKey = env?.maptilerKey || import.meta.env.VITE_MAPTILER_KEY || 'cE27yWwG20q9Z14q8T1o';
        const map = new window.maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`, 
            center: [lng, lat],
            zoom: 15,
            pitch: 55,
            bearing: -15
        });

        mapRef.current = map;
        map.addControl(new window.maplibregl.NavigationControl());

        const setupLayers = () => {
            const style = map.getStyle();
            if (!style || !style.layers) return;
            
            let labelLayerId;
            for (let i = 0; i < style.layers.length; i++) {
                if (style.layers[i].type === 'symbol' && style.layers[i].layout && style.layers[i].layout['text-field']) {
                    labelLayerId = style.layers[i].id;
                    break;
                }
            }

            const currentStyle = style.name || '';
            const sourceName = map.getSource('openmaptiles') ? 'openmaptiles' : (map.getSource('maptiler') ? 'maptiler' : null);
            if (!map.getLayer('3d-buildings') && !currentStyle.toLowerCase().includes('hybrid') && sourceName) {
                try {
                    map.addLayer({
                        'id': '3d-buildings',
                        'source': sourceName,
                        'source-layer': 'building',
                        'type': 'fill-extrusion',
                        'minzoom': 13,
                        'paint': {
                            'fill-extrusion-color': '#4f46e5',
                            'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 13.5, ['get', 'render_height']],
                            'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 13, 0, 13.5, ['get', 'render_min_height']],
                            'fill-extrusion-opacity': 0.65
                        }
                    }, labelLayerId);
                } catch (e) {
                    console.warn("Could not load 3D buildings layer:", e);
                }
            }
        };

        map.on('style.load', setupLayers);

        map.on('load', setupLayers);

        const typeColors = {
            'crime': '#ef4444',
            'accident': '#f59e0b',
            'suspicious': '#8b5cf6',
            'other': '#6b7280'
        };
        const markerColor = typeColors[report.type] || '#6b7280';

        new window.maplibregl.Marker({ color: markerColor })
            .setLngLat([lng, lat])
            .addTo(map);
    };

    return (
        <AppLayout header="Incident Details">
            <Head title="Incident Details" />
            
            <style>
                {`#incident-map { height: 350px; border-radius: 0.75rem; }`}
            </style>

            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Back Navigation & Status Bar */}
                <div className="premium-card flex flex-wrap items-center justify-between gap-4">
                    <Link href={route('reports.index')} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Incident Reports
                    </Link>
                    
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                        <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm ${
                            report.status === 'resolved' ? 'bg-green-100 text-green-700 border border-green-200' : ''
                        } ${
                            report.status === 'investigating' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : ''
                        } ${
                            report.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' : ''
                        }`}>
                            {report.status}
                        </span>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Incident Details & Description */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="premium-card">
                            {/* Cover Image */}
                            {report.image ? (
                                <div className="relative h-96 w-full bg-slate-900">
                                    <img src={report.image.startsWith('http') ? report.image : `/storage/${report.image}`} alt={report.title} className="h-full w-full object-contain" />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-20">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md ${
                                            report.type === 'crime' ? 'bg-red-500 text-white' : ''
                                        } ${
                                            report.type === 'accident' ? 'bg-amber-500 text-white' : ''
                                        } ${
                                            report.type === 'suspicious' ? 'bg-purple-500 text-white' : ''
                                        } ${
                                            report.type === 'other' ? 'bg-gray-500 text-white' : ''
                                        }`}>
                                            {report.type}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 bg-slate-50 flex flex-col items-center justify-center text-gray-300 border-b border-gray-100 relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm text-gray-400 font-semibold">No Image Uploaded</span>
                                    <div className="absolute bottom-4 left-6">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                                            report.type === 'crime' ? 'bg-red-100 text-red-700' : ''
                                        } ${
                                            report.type === 'accident' ? 'bg-amber-100 text-amber-700' : ''
                                        } ${
                                            report.type === 'suspicious' ? 'bg-purple-100 text-purple-700' : ''
                                        } ${
                                            report.type === 'other' ? 'bg-gray-100 text-gray-700' : ''
                                        }`}>
                                            {report.type}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Content Body */}
                            <div className="p-8">
                                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                                    {report.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-6 border-b border-gray-100 mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                            {report.user.name.substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Reported By</p>
                                            <p className="font-bold text-gray-700">{report.user.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Date & Time</p>
                                            <p className="font-bold text-gray-700">{dayjs(report.datetime).format('MMM DD, YYYY - hh:mm A')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Location Area</p>
                                            <p className="font-bold text-gray-700">{report.location}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose max-w-none">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">Incident Description</h3>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                                        {report.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Interactive Pin Map & Safety Advisories */}
                    <div className="space-y-6">
                        {/* Dispatch / Volunteer Status Card */}
                        <div className="premium-card p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Dispatch Details
                            </h3>

                            {report.responder ? (
                                <>
                                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                            {report.responder.name.substring(0, 1)}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Assigned Responder</p>
                                            <p className="font-bold text-gray-800">{report.responder.name}</p>
                                        </div>
                                    </div>

                                    {report.status !== 'resolved' && (auth.user.role === 'admin' || auth.user.id === report.responder_id) && (
                                        <form onSubmit={handleResolve} className="mt-4">
                                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Resolve Incident
                                            </button>
                                        </form>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                                        <p className="text-sm text-amber-800 font-semibold">No Responder Dispatched Yet</p>
                                        <p className="text-xs text-amber-600 mt-1">This report is pending response.</p>
                                    </div>

                                    {auth.user.role === 'responder' && (
                                        <form onSubmit={handleVolunteer} className="mt-4">
                                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
                                                🙋 Volunteer to Respond
                                            </button>
                                        </form>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Location Map Card */}
                        <div className="premium-card p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                Geographic Location
                            </h3>
                            
                            {report.latitude && report.longitude ? (
                                <>
                                    <div className="relative mb-4">
                                        <div id="incident-map" ref={mapContainer} className="w-full border border-gray-200"></div>
                                        <button
                                            type="button"
                                            onClick={toggle3D}
                                            className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 transition"
                                        >
                                            {is3D ? '🗺️ 2D' : '🏙️ 3D View'}
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="text-xs text-gray-400 font-semibold space-y-1">
                                            <p>Latitude: <span className="text-gray-600 font-mono">{report.latitude}</span></p>
                                            <p>Longitude: <span className="text-gray-600 font-mono">{report.longitude}</span></p>
                                        </div>
                                        
                                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Navigate to Scene
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <div className="h-48 bg-slate-50 flex flex-col items-center justify-center text-gray-400 rounded-lg border border-dashed border-gray-200 text-center p-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    <p className="font-bold text-sm">No exact coordinates</p>
                                    <p className="text-xs text-gray-400 mt-1">This report was logged using written location details only.</p>
                                </div>
                            )}
                        </div>

                        {/* Community Advisory Info */}
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
                            <h4 className="text-indigo-900 font-bold text-base mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Safety Advisory
                            </h4>
                            <p className="text-xs text-indigo-700 leading-relaxed mb-4">
                                If you reside near <strong>{report.location}</strong>, please remain vigilant. Stay updated on resolution progress, and contact neighborhood authorities if you observe further suspicious activities.
                            </p>
                            <div className="text-xs font-semibold text-indigo-500">
                                Neighborhood Security Dispatch
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

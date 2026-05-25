import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';

export default function Index({ reports, neighborhoodLat, neighborhoodLng, neighborhoodBoundary, neighborhoodName }) {
    const { env } = usePage().props;
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const [search, setSearch] = useState(new URLSearchParams(window.location.search).get('search') || '');
    const [type, setType] = useState(new URLSearchParams(window.location.search).get('type') || '');
    const [isLocating, setIsLocating] = useState(false);
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
    
    const hasSearch = new URLSearchParams(window.location.search).has('search');
    const hasType = new URLSearchParams(window.location.search).has('type');
    const hasLat = new URLSearchParams(window.location.search).has('lat');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('reports.index'), { search, type }, { preserveState: true });
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setType(newType);
        router.get(route('reports.index'), { search, type: newType }, { preserveState: true });
    };

    const findNearMe = (e) => {
        e.preventDefault();
        if (navigator.geolocation) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                router.get(route('reports.index'), { search, type, lat, lng }, { 
                    preserveState: true,
                    onFinish: () => setIsLocating(false)
                });
            }, (error) => {
                alert("Could not get your location. Please make sure location services are enabled.");
                setIsLocating(false);
            });
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    useEffect(() => {
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
    }, [reports.data, neighborhoodLat, neighborhoodLng, neighborhoodBoundary]);

    const initMap = () => {
        if (mapRef.current) {
            mapRef.current.remove();
        }

        const maptilerKey = env?.maptilerKey || import.meta.env.VITE_MAPTILER_KEY || 'cE27yWwG20q9Z14q8T1o';
        const map = new window.maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${maptilerKey}`,
            center: [neighborhoodLng, neighborhoodLat],
            zoom: 14,
            pitch: 55,
            bearing: -15
        });

        mapRef.current = map;
        map.addControl(new window.maplibregl.NavigationControl());

        let boundaryJson = null;
        if (neighborhoodBoundary) {
            try {
                boundaryJson = typeof neighborhoodBoundary === 'string' ? JSON.parse(neighborhoodBoundary) : neighborhoodBoundary;
            } catch (e) {
                console.error('Invalid boundary JSON', e);
            }
        }

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

            if (boundaryJson && !map.getSource('neighborhood-boundary')) {
                map.addSource('neighborhood-boundary', {
                    type: 'geojson',
                    data: boundaryJson
                });

                map.addLayer({
                    id: 'boundary-fill',
                    type: 'fill',
                    source: 'neighborhood-boundary',
                    paint: { 'fill-color': '#6366f1', 'fill-opacity': 0.15 }
                });

                map.addLayer({
                    id: 'boundary-line',
                    type: 'line',
                    source: 'neighborhood-boundary',
                    paint: { 'line-color': '#4f46e5', 'line-width': 3 }
                });
            }
        };

        map.on('style.load', setupLayers);

        map.on('load', () => {
            if (boundaryJson) {
                try {
                    const coordinates = boundaryJson.features[0].geometry.coordinates[0];
                    const bounds = coordinates.reduce((b, coord) => b.extend(coord), new window.maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
                    map.fitBounds(bounds, { padding: 40, maxZoom: 16 });
                } catch (err) {
                    console.error('Error fitting bounds:', err);
                }
            }

            const bounds = new window.maplibregl.LngLatBounds();
            let hasCoords = false;

            reports.data.forEach((report) => {
                if (report.latitude && report.longitude) {
                    const lat = parseFloat(report.latitude);
                    const lng = parseFloat(report.longitude);
                    
                    const typeColors = {
                        'crime': '#ef4444',
                        'accident': '#f59e0b',
                        'suspicious': '#818cf8',
                        'other': '#94a3b8'
                    };
                    const markerColor = typeColors[report.type] || '#94a3b8';
                    const showUrl = route('reports.show', report.id);

                    const popupContent = `
                        <div class="p-1 min-w-[200px]">
                            <div class="text-[10px] font-black uppercase mb-1 tracking-widest" style="color: ${markerColor}">${report.type}</div>
                            <h4 class="font-bold text-white text-sm mb-1 hover:text-indigo-400 transition">
                                <a href="${showUrl}">${report.title}</a>
                            </h4>
                            <p class="text-xs text-slate-300 mb-2 leading-relaxed">${report.description.substring(0, 80)}${report.description.length > 80 ? '...' : ''}</p>
                            <a href="${showUrl}" class="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">
                                View Details
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    `;

                    const popup = new window.maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

                    new window.maplibregl.Marker({ color: markerColor })
                        .setLngLat([lng, lat])
                        .setPopup(popup)
                        .addTo(map);

                    bounds.extend([lng, lat]);
                    hasCoords = true;
                }
            });

            if (hasCoords) {
                map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
            }
        });
    };

    const switchMapStyle = (styleName, e) => {
        if(mapRef.current) {
            const maptilerKey = env?.maptilerKey || import.meta.env.VITE_MAPTILER_KEY || 'cE27yWwG20q9Z14q8T1o';
            mapRef.current.setStyle(`https://api.maptiler.com/maps/${styleName}/style.json?key=${maptilerKey}`);
            document.querySelectorAll('.map-style-btn').forEach((btn) => {
                btn.className = 'map-style-btn px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer';
            });
            e.currentTarget.className = 'map-style-btn px-3 py-1.5 rounded-lg transition bg-slate-800 text-white border border-slate-700 shadow-sm cursor-pointer';
        }
    };

    return (
        <AppLayout header="All Incident Reports">
            <Head title="All Incident Reports" />
            
            <style>
                {`
                #global-map { height: 400px; z-index: 10; border-radius: 0.75rem; }
                .glass-card {
                    background: rgba(15, 23, 42, 0.65);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(30, 41, 59, 0.8);
                }
                .maplibregl-popup-content {
                    background: rgba(15, 23, 42, 0.95) !important;
                    color: #f8fafc !important;
                    border: 1px solid rgba(99, 102, 241, 0.4) !important;
                    border-radius: 12px !important;
                    backdrop-filter: blur(10px) !important;
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.25) !important;
                }
                .maplibregl-popup-anchor-top .maplibregl-popup-tip { border-bottom-color: rgba(15, 23, 42, 0.95) !important; }
                .maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color: rgba(15, 23, 42, 0.95) !important; }
                .maplibregl-popup-anchor-left .maplibregl-popup-tip { border-right-color: rgba(15, 23, 42, 0.95) !important; }
                .maplibregl-popup-anchor-right .maplibregl-popup-tip { border-left-color: rgba(15, 23, 42, 0.95) !important; }
                .maplibregl-popup-close-button { color: #94a3b8 !important; }
                `}
            </style>

            <div className="space-y-6">
                {/* Filters and Search */}
                <div className="premium-card p-4">
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input type="text" name="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by location..." className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition placeholder-slate-500 font-medium" />
                            </div>
                        </div>

                        <div className="w-full md:w-48">
                            <select name="type" value={type} onChange={handleTypeChange} className="w-full p-2 bg-slate-900/80 border border-slate-800 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium">
                                <option value="" className="bg-slate-900">All Types</option>
                                <option value="crime" className="bg-slate-900">Crime</option>
                                <option value="accident" className="bg-slate-900">Accident</option>
                                <option value="suspicious" className="bg-slate-900">Suspicious</option>
                                <option value="other" className="bg-slate-900">Other</option>
                            </select>
                        </div>

                        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                            Filter
                        </button>
                        
                        <button type="button" onClick={findNearMe} disabled={isLocating} className="bg-emerald-600 disabled:bg-emerald-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                            {isLocating ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Locating...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    Near Me (5km)
                                </>
                            )}
                        </button>
                        
                        {(hasSearch || hasType || hasLat) && (
                            <Link href={route('reports.index')} className="text-sm text-slate-400 hover:text-indigo-400 font-bold underline">Clear filters</Link>
                        )}
                    </form>

                    {hasLat && (
                        <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 rounded-lg text-sm flex items-center justify-between font-bold">
                            <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                Showing incidents within 5km of your location.
                            </span>
                            <Link href={route('reports.index')} className="font-black hover:underline uppercase text-xs tracking-wider">Clear</Link>
                        </div>
                    )}
                </div>

                {/* Global Incidents Map */}
                <div className="glass-card p-4 rounded-xl shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <h3 className="text-lg font-black text-indigo-100 font-serif-custom">Incident Map View</h3>
                        <div className="flex gap-1 bg-slate-950 p-1 rounded-xl text-xs font-bold border border-slate-800 self-start sm:self-auto shadow-sm">
                            <button type="button" onClick={(e) => switchMapStyle('dataviz-dark', e)} className="map-style-btn px-3 py-1.5 rounded-lg transition bg-slate-800 text-white border border-slate-700 shadow-sm cursor-pointer">
                                🛸 Tactical
                            </button>
                            <button type="button" onClick={(e) => switchMapStyle('basic-v2-dark', e)} className="map-style-btn px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer">
                                🌌 Cyber Dark
                            </button>
                            <button type="button" onClick={(e) => switchMapStyle('hybrid', e)} className="map-style-btn px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer">
                                🛰️ Satellite
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div id="global-map" ref={mapContainer} className="w-full border border-slate-800"></div>
                        <button
                            type="button"
                            onClick={toggle3D}
                            className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 transition"
                        >
                            {is3D ? '🗺️ 2D' : '🏙️ 3D View'}
                        </button>
                    </div>
                </div>

                {/* Reports Grid */}
                {reports.data.length === 0 ? (
                    <div className="glass-card p-20 rounded-xl text-center">
                        <div className="mb-4 flex justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-indigo-100">No reports available</h3>
                        <p className="text-slate-400 mt-2">No incidents have been reported in this category or location.</p>
                        <Link href={route('reports.create')} className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                            Report an Incident
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.data.map((report) => (
                            <div key={report.id} className="glass-card rounded-xl hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] transition duration-300 overflow-hidden flex flex-col group">
                                {report.image ? (
                                    <div className="overflow-hidden h-48 w-full border-b border-slate-800/80">
                                        <img src={report.image.startsWith('http') ? report.image : `/storage/${report.image}`} alt={report.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                                    </div>
                                ) : (
                                    <div className="h-48 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-center text-slate-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                            report.type === 'crime' ? 'bg-red-950/60 text-red-400 border border-red-800/50' : ''
                                        } ${
                                            report.type === 'accident' ? 'bg-yellow-950/60 text-yellow-400 border border-yellow-800/50' : ''
                                        } ${
                                            report.type === 'suspicious' ? 'bg-purple-950/60 text-purple-400 border border-purple-800/50' : ''
                                        } ${
                                            report.type === 'other' ? 'bg-slate-900/60 text-slate-400 border border-slate-800/50' : ''
                                        }`}>
                                            {report.type}
                                        </span>
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                            report.status === 'resolved' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' : 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                                        }`}>
                                            {report.status}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white line-clamp-1 mb-2 hover:text-indigo-400 transition font-serif-custom">
                                        <Link href={route('reports.show', report.id)}>{report.title}</Link>
                                    </h3>
                                    <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">{report.description}</p>

                                    <div className="mt-auto space-y-2 border-t border-slate-850 pt-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                            {report.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {dayjs(report.datetime).format('MMM DD, YYYY - hh:mm A')}
                                        </div>
                                        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 pt-1">
                                            <div>Reported by: <span className="font-bold text-slate-400">{report.user.name}</span></div>
                                            <Link href={route('reports.show', report.id)} className="text-indigo-400 hover:text-indigo-300 font-black flex items-center gap-0.5 transition uppercase tracking-wider text-[10px]">
                                                Details
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {reports.links && reports.links.length > 3 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex space-x-1">
                            {reports.links.map((link, index) => (
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-4 py-2 border rounded-md text-sm font-bold transition ${
                                            link.active ? 'bg-indigo-600/30 text-indigo-400 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border-slate-800'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="px-4 py-2 border rounded-md text-sm font-bold bg-slate-950/40 text-slate-600 border-slate-900 cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

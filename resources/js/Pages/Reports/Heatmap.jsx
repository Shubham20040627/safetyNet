import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Heatmap({ reports, neighborhoodLat, neighborhoodLng, neighborhoodBoundary }) {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const layerGroupRef = useRef(null);
    const [currentStyle, setCurrentStyle] = useState('streets-v2');

    useEffect(() => {
        const loadLeaflet = async () => {
            if (!window.L) {
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                    const link = document.createElement('link');
                    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                    link.rel = 'stylesheet';
                    document.head.appendChild(link);
                });
            }
            if (!window.L.heatLayer) {
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/leaflet.heat@0.2.0/dist/leaflet-heat.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
            }
            initMap();
        };

        if (mapContainer.current) {
            loadLeaflet();
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const initMap = () => {
        if (mapRef.current) return;

        const L = window.L;
        const map = L.map(mapContainer.current).setView([neighborhoodLat, neighborhoodLng], 14);
        mapRef.current = map;

        const maptilerKey = 'cE27yWwG20q9Z14q8T1o'; // Should be from props ideally

        const baseLayers = {
            'streets-v2': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                maxZoom: 20
            }),
            'outdoor-v2': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                maxZoom: 20
            }),
            'hybrid': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 18
            })
        };

        layerGroupRef.current = {
            layers: baseLayers,
            current: baseLayers['streets-v2'].addTo(map),
            boundary: null
        };

        let boundaryGeojson = null;
        if (neighborhoodBoundary) {
            try {
                boundaryGeojson = typeof neighborhoodBoundary === 'string' ? JSON.parse(neighborhoodBoundary) : neighborhoodBoundary;
                
                layerGroupRef.current.boundary = L.geoJSON(boundaryGeojson, {
                    style: {
                        color: '#4f46e5',
                        weight: 3,
                        opacity: 0.8,
                        fillColor: '#6366f1',
                        fillOpacity: 0.12
                    }
                }).addTo(map);
                
                map.fitBounds(layerGroupRef.current.boundary.getBounds(), { padding: [30, 30] });
            } catch (err) {
                console.error("Error loading Leaflet geofence boundary:", err);
            }
        }

        const heatData = reports.map(report => [
            parseFloat(report.latitude),
            parseFloat(report.longitude),
            0.8
        ]);

        L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: {
                0.2: 'rgba(99, 102, 241, 0.2)',
                0.4: 'rgba(129, 140, 248, 0.5)',
                0.6: 'rgba(236, 72, 153, 0.7)',
                0.8: 'rgba(244, 63, 94, 0.95)',
                1.0: '#f43f5e'
            }
        }).addTo(map);

        reports.forEach(report => {
            const color = report.priority === 'critical' ? '#ef4444' : '#f59e0b';
            L.circleMarker([parseFloat(report.latitude), parseFloat(report.longitude)], {
                radius: 5,
                fillColor: color,
                color: "#0f172a",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            })
            .bindPopup(`<div class="text-xs font-bold text-white mb-1 font-serif-custom">${report.title}</div><div class="text-[9px] uppercase tracking-wider font-black text-slate-400">Priority: <span class="${report.priority === 'critical' ? 'text-red-400' : 'text-amber-400'}">${report.priority}</span></div>`)
            .addTo(map);
        });
    };

    const switchMapStyle = (styleName) => {
        if (!mapRef.current || !layerGroupRef.current || !layerGroupRef.current.layers[styleName]) return;
        
        const map = mapRef.current;
        const layers = layerGroupRef.current.layers;
        
        map.removeLayer(layerGroupRef.current.current);
        layerGroupRef.current.current = layers[styleName].addTo(map);

        if (layerGroupRef.current.boundary) {
            layerGroupRef.current.boundary.bringToFront();
        }

        setCurrentStyle(styleName);
    };

    return (
        <AppLayout header="Security Heatmap">
            <Head title="Security Heatmap" />
            
            <style>
                {`
                .leaflet-container { font-family: inherit; }
                .glass-card {
                    background: rgba(15, 23, 42, 0.65);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(30, 41, 59, 0.8);
                }
                .leaflet-popup-content-wrapper {
                    background: rgba(15, 23, 42, 0.95) !important;
                    color: #f8fafc !important;
                    border: 1px solid rgba(99, 102, 241, 0.4) !important;
                    border-radius: 12px !important;
                    backdrop-filter: blur(10px) !important;
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.25) !important;
                }
                .leaflet-popup-tip {
                    background: rgba(15, 23, 42, 0.95) !important;
                    border: 1px solid rgba(99, 102, 241, 0.4) !important;
                }
                .leaflet-popup-close-button { color: #94a3b8 !important; }
                `}
            </style>

            <div className="space-y-6">
                <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-800/80 flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h3 className="text-xl font-black text-indigo-100 tracking-tight font-serif-custom">Neighborhood Danger Zones</h3>
                            <p className="text-sm text-slate-400 font-medium">Visualizing incident density to identify unsafe areas.</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Style Switcher Buttons */}
                            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl text-xs font-bold border border-slate-800 shadow-sm">
                                <button type="button" onClick={() => switchMapStyle('streets-v2')} className={`map-style-btn px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer ${currentStyle === 'streets-v2' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                                    🛸 Tactical Dark
                                </button>
                                <button type="button" onClick={() => switchMapStyle('outdoor-v2')} className={`map-style-btn px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer ${currentStyle === 'outdoor-v2' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                                    🌌 Radar Minimal
                                </button>
                                <button type="button" onClick={() => switchMapStyle('hybrid')} className={`map-style-btn px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer ${currentStyle === 'hybrid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                                    🛰️ Satellite
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/60 text-red-400 rounded-lg text-xs font-bold border border-red-900/50">
                                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                                    High Risk
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/60 text-amber-400 rounded-lg text-xs font-bold border border-amber-900/50">
                                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                                    Medium Risk
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="heatmap" ref={mapContainer} className="h-[600px] w-full bg-slate-950 z-10"></div>
                </div>

                {/* Legend & Analytics Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-850">
                        <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 mb-4">Map Controls</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            The heatmap intensity represents the frequency of incidents in a specific radius. Red zones indicate multiple reports in close proximity.
                        </p>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                                <span>LOW DENSITY</span>
                                <span>HIGH DENSITY</span>
                            </div>
                            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-pink-500 to-rose-500 rounded-full"></div>
                        </div>
                    </div>
                    
                    <div className="md:col-span-2 glass-card rounded-2xl p-6 shadow-md flex flex-col justify-between">
                        <div>
                            <h4 className="font-bold text-indigo-100 mb-3 font-serif-custom">Safety Recommendation</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Based on current data, avoid walking alone in the "Red Hot" areas during late hours. Security patrols have been prioritized for these high-density zones.
                            </p>
                        </div>
                        <div className="mt-4 flex gap-4">
                            <div className="flex-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Data Points</span>
                                <span className="text-2xl font-black text-white">{reports.length}</span>
                            </div>
                            <div className="flex-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Hotspots</span>
                                <span className="text-2xl font-black text-rose-500">Calculated Live</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

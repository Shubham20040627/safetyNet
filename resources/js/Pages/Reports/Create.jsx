import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Create({ neighborhoodLat, neighborhoodLng, neighborhoodBoundary, neighborhoodName }) {
    const { env } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        type: '',
        datetime: '',
        location: '',
        latitude: '',
        longitude: '',
        description: '',
        image: null,
    });

    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [fileName, setFileName] = useState('');
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
    }, []);

    const initMap = () => {
        if (mapRef.current) return;

        let boundaryJson = null;
        if (neighborhoodBoundary) {
            try {
                boundaryJson = typeof neighborhoodBoundary === 'string' ? JSON.parse(neighborhoodBoundary) : neighborhoodBoundary;
            } catch (e) {
                console.error('Invalid boundary JSON', e);
            }
        }

        const maptilerKey = env?.maptilerKey || import.meta.env.VITE_MAPTILER_KEY || 'cE27yWwG20q9Z14q8T1o';
        const map = new window.maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`,
            center: [neighborhoodLng, neighborhoodLat],
            zoom: 14,
            pitch: 55,
            bearing: -15
        });

        mapRef.current = map;
        map.addControl(new window.maplibregl.NavigationControl());
        
        const geolocate = new window.maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserLocation: true
        });
        map.addControl(geolocate);

        const setupLayers = () => {
            const style = map.getStyle();
            let labelLayerId;
            if (style && style.layers) {
                for (let i = 0; i < style.layers.length; i++) {
                    if (style.layers[i].type === 'symbol' && style.layers[i].layout && style.layers[i].layout['text-field']) {
                        labelLayerId = style.layers[i].id;
                        break;
                    }
                }
            }

            const currentStyle = style?.name || '';
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

        map.on('load', () => {
            setupLayers();

            if (boundaryJson && !map.getSource('neighborhood-boundary')) {
                map.addSource('neighborhood-boundary', {
                    type: 'geojson',
                    data: boundaryJson
                });

                map.addLayer({
                    id: 'boundary-fill',
                    type: 'fill',
                    source: 'neighborhood-boundary',
                    paint: { 'fill-color': '#4f46e5', 'fill-opacity': 0.22 }
                });

                map.addLayer({
                    id: 'boundary-line',
                    type: 'line',
                    source: 'neighborhood-boundary',
                    paint: { 'line-color': '#6366f1', 'line-width': 4 }
                });

                try {
                    const coordinates = boundaryJson.features[0].geometry.coordinates[0];
                    const bounds = coordinates.reduce((b, coord) => b.extend(coord), new window.maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
                    map.fitBounds(bounds, { padding: 40, maxZoom: 16 });
                } catch (err) {
                    console.error('Error fitting bounds:', err);
                }
            }
        });

        const isPointInPolygon = (point, polygonCoords) => {
            const x = point[0], y = point[1];
            let inside = false;
            for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
                const xi = polygonCoords[i][0], yi = polygonCoords[i][1];
                const xj = polygonCoords[j][0], yj = polygonCoords[j][1];
                const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        };

        const isPointInGeofence = (lng, lat) => {
            if (!boundaryJson || !boundaryJson.features || boundaryJson.features.length === 0) return true;
            const point = [lng, lat];
            const feature = boundaryJson.features[0];
            if (feature.geometry.type === 'Polygon') {
                return isPointInPolygon(point, feature.geometry.coordinates[0]);
            } else if (feature.geometry.type === 'MultiPolygon') {
                for (let i = 0; i < feature.geometry.coordinates.length; i++) {
                    if (isPointInPolygon(point, feature.geometry.coordinates[i][0])) return true;
                }
            }
            return false;
        };

        const getAddressFromCoords = (lat, lng) => {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
                .then(response => response.json())
                .then(res => {
                    if (res.display_name) {
                        const address = res.address;
                        let shortAddress = "";
                        if (address.road) shortAddress += address.road;
                        if (address.suburb || address.city || address.town || address.village) {
                            shortAddress += (shortAddress ? ", " : "") + (address.suburb || address.city || address.town || address.village);
                        }
                        setData(d => ({ ...d, location: shortAddress || res.display_name }));
                    }
                })
                .catch(err => console.error("Geocoding failed:", err));
        };

        map.on('click', (e) => {
            const lat = parseFloat(e.lngLat.lat.toFixed(6));
            const lng = parseFloat(e.lngLat.lng.toFixed(6));

            if (!isPointInGeofence(lng, lat)) {
                alert(`🚫 Geofence Restriction!\n\nYou must only report incidents inside your neighborhood's registered boundary (${neighborhoodName || 'Assigned Zone'}).\n\nPlease click inside the highlighted region.`);
                return;
            }

            if (markerRef.current) {
                markerRef.current.setLngLat([lng, lat]);
            } else {
                markerRef.current = new window.maplibregl.Marker({ color: "#ef4444" }).setLngLat([lng, lat]).addTo(map);
            }

            setData(d => ({ ...d, latitude: lat.toString(), longitude: lng.toString() }));
            getAddressFromCoords(lat, lng);
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('reports.store'));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        setFileName(file ? `✓ Selected: ${file.name}` : '');
    };

    return (
        <AppLayout header="Report an Incident">
            <Head title="Report an Incident" />
            
            <style>
                {`#map { height: 350px; z-index: 10; border-radius: 0.75rem; }
                .form-input {
                    width: 100%;
                    background: rgba(5, 8, 14, 0.6);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: #e2e8f0;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                    outline: none;
                }
                .form-input:focus {
                    border-color: rgba(99,102,241,0.5);
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
                    background: rgba(8, 12, 24, 0.7);
                }
                .form-input::placeholder { color: #475569; }
                .form-input option { background: #0b0f1a; color: #e2e8f0; }
                `}
            </style>

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-100 font-jakarta tracking-tight">Submit Incident Report</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Provide accurate details to assist community safety officers.</p>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="premium-card rounded-2xl overflow-hidden">
                    <form onSubmit={submit} encType="multipart/form-data">
                        {/* Form Section: Basic Info */}
                        <div className="p-6 border-b border-white/[0.04]">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">01 — Incident Details</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label htmlFor="title" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Incident Title</label>
                                    <input type="text" name="title" id="title" value={data.title} onChange={e => setData('title', e.target.value)} className="form-input" placeholder="e.g., Suspicious activity near Park Avenue" required />
                                    {errors.title && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.title}</p>}
                                </div>

                                {/* Type */}
                                <div>
                                    <label htmlFor="type" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Incident Type</label>
                                    <select name="type" id="type" value={data.type} onChange={e => setData('type', e.target.value)} className="form-input" required>
                                        <option value="">Select Type</option>
                                        <option value="crime">Crime</option>
                                        <option value="accident">Accident</option>
                                        <option value="suspicious">Suspicious Activity</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.type && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.type}</p>}
                                </div>

                                {/* Date & Time */}
                                <div>
                                    <label htmlFor="datetime" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date & Time</label>
                                    <input type="datetime-local" name="datetime" id="datetime" value={data.datetime} onChange={e => setData('datetime', e.target.value)} className="form-input" required />
                                    {errors.datetime && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.datetime}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Form Section: Location */}
                        <div className="p-6 border-b border-white/[0.04]">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">02 — Location & Coordinates</p>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="location" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location Name</label>
                                    <input type="text" name="location" id="location" value={data.location} onChange={e => setData('location', e.target.value)} className="form-input" placeholder="Enter street name or landmark" required />
                                    {errors.location && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.location}</p>}
                                </div>

                                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Click on the map to drop a pin and auto-fill coordinates
                                </p>

                                <div className="relative">
                                    <div ref={mapContainer} id="map" className="w-full border border-slate-800/60 shadow-xl"></div>
                                    <button
                                        type="button"
                                        onClick={toggle3D}
                                        className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 transition"
                                    >
                                        {is3D ? '🗺️ 2D' : '🏙️ 3D View'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="latitude" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Latitude</label>
                                        <input type="text" name="latitude" id="latitude" value={data.latitude} onChange={e => setData('latitude', e.target.value)} className="form-input" placeholder="e.g. 40.7128" />
                                    </div>
                                    <div>
                                        <label htmlFor="longitude" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Longitude</label>
                                        <input type="text" name="longitude" id="longitude" value={data.longitude} onChange={e => setData('longitude', e.target.value)} className="form-input" placeholder="e.g. -74.0060" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Section: Description */}
                        <div className="p-6 border-b border-white/[0.04]">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">03 — Incident Description</p>
                            <textarea name="description" id="description" rows="4" value={data.description} onChange={e => setData('description', e.target.value)} className="form-input resize-none" placeholder="Describe the incident in detail — what happened, who was involved, and any other relevant details..." required></textarea>
                            {errors.description && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.description}</p>}
                        </div>

                        {/* Form Section: Image Upload */}
                        <div className="p-6 border-b border-white/[0.04]">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">04 — Evidence Image (Optional)</p>
                            <div onClick={() => document.getElementById('image').click()} className="group flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all duration-200 cursor-pointer hover:bg-indigo-500/5">
                                <div className="h-12 w-12 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
                                    <svg className="h-6 w-6 text-slate-600 group-hover:text-indigo-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors">Drop image here or click to browse</p>
                                    <p className="text-xs text-slate-600 mt-0.5">PNG, JPG, GIF up to 10MB</p>
                                </div>
                                {fileName && <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">{fileName}</p>}
                                <input id="image" name="image" type="file" className="hidden" onChange={handleFileChange} />
                            </div>
                            {errors.image && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><span>⚠</span>{errors.image}</p>}
                        </div>

                        {/* Actions */}
                        <div className="p-6 flex items-center justify-between gap-4">
                            <Link href={route('dashboard')} className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest text-slate-400 hover:text-white border border-slate-800/60 hover:border-slate-700 rounded-xl transition-all duration-200 bg-slate-950/30 hover:bg-slate-900/60">
                                Cancel
                            </Link>
                            <button type="submit" disabled={processing} className={`inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all duration-200 shadow-lg shadow-indigo-900/40 active:scale-95 ${processing ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-indigo-900/60'}`}>
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Submit Report
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

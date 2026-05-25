import React, { useState, useEffect, useRef } from 'react';
import GuestLayout from '../../Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function AdminRegister() {
    const { props } = usePage();
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        neighborhood_name: '',
        neighborhood_lat: '',
        neighborhood_lng: '',
        neighborhood_boundary: '',
    });

    const [step, setStep] = useState(1);
    const [is3D, setIs3D] = useState(true);
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const drawRef = useRef(null);

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

    // Load scripts dynamically to avoid SSR/Vite issues with MapLibre/MapboxDraw
    useEffect(() => {
        if (step === 2 && !mapRef.current) {
            const loadScripts = async () => {
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
                
                if (!window.MapboxDraw) {
                    await new Promise((resolve) => {
                        const script = document.createElement('script');
                        script.src = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.js';
                        script.onload = resolve;
                        document.head.appendChild(script);
                        const link = document.createElement('link');
                        link.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.css';
                        link.rel = 'stylesheet';
                        document.head.appendChild(link);
                    });
                }

                initMap();
            };
            loadScripts();
        }
    }, [step]);

    const initMap = () => {
        const defaultCenter = [77.2090, 28.6139]; 
        
        const maptilerKey = props.env?.maptilerKey || import.meta.env.VITE_MAPTILER_KEY || 'cE27yWwG20q9Z14q8T1o';

        const map = new window.maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`, 
            center: defaultCenter, 
            zoom: 11,
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
                    console.warn("Could not load 3D buildings:", e);
                }
            }
        };

        map.on('style.load', setupLayers);

        const geolocate = new window.maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserLocation: true
        });
        map.addControl(geolocate);

        map.on('load', () => {
            geolocate.trigger();
            setupLayers();
        });

        const draw = new window.MapboxDraw({
            displayControlsDefault: false,
            controls: { polygon: true, trash: true },
            defaultMode: 'draw_polygon'
        });
        drawRef.current = draw;
        map.addControl(draw);

        const updateBoundaryInputs = () => {
            const drawData = draw.getAll();
            if (drawData.features.length > 0) {
                setData('neighborhood_boundary', JSON.stringify(drawData));
                
                const coordinates = drawData.features[0].geometry.coordinates[0];
                let latSum = 0;
                let lngSum = 0;
                let count = coordinates.length - 1;
                if (count < 1) count = coordinates.length;

                for (let i = 0; i < count; i++) {
                    lngSum += coordinates[i][0];
                    latSum += coordinates[i][1];
                }

                const centerLat = (latSum / count).toFixed(6);
                const centerLng = (lngSum / count).toFixed(6);

                setData(data => ({
                    ...data,
                    neighborhood_boundary: JSON.stringify(drawData),
                    neighborhood_lat: centerLat,
                    neighborhood_lng: centerLng
                }));

                getNeighborhoodName(centerLat, centerLng);
            } else {
                setData(data => ({
                    ...data,
                    neighborhood_boundary: '',
                    neighborhood_lat: '',
                    neighborhood_lng: ''
                }));
            }
        };

        map.on('draw.create', updateBoundaryInputs);
        map.on('draw.update', updateBoundaryInputs);
        map.on('draw.delete', updateBoundaryInputs);
    };

    const getNeighborhoodName = (lat, lng) => {
        if (data.neighborhood_name.trim() === "" || data.neighborhood_name.includes("Safety Corridor")) {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
                .then(response => response.json())
                .then(res => {
                    if(res.address) {
                        const place = res.address.suburb || res.address.neighbourhood || res.address.village || res.address.city_district || res.address.city;
                        if (place) {
                            setData('neighborhood_name', place + " Safety Corridor");
                        }
                    }
                })
                .catch(err => console.error(err));
        }
    };

    const nextStep = () => {
        if (!data.name || !data.email || !data.neighborhood_name || !data.password) {
            alert("Please fill out all credentials to proceed to the map region selection.");
            return;
        }
        setStep(2);
        setTimeout(() => {
            if (mapRef.current) mapRef.current.resize();
        }, 200);
    };

    const prevStep = () => {
        setStep(1);
    };

    const triggerDraw = () => {
        if(drawRef.current) drawRef.current.changeMode('draw_polygon');
    };

    const clearDraw = () => {
        if(drawRef.current) {
            drawRef.current.deleteAll();
            setData(data => ({
                ...data,
                neighborhood_boundary: '',
                neighborhood_lat: '',
                neighborhood_lng: ''
            }));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.register'));
    };

    return (
        <GuestLayout>
            <Head title="Admin Register" />
            <style>
                {`
                #map { height: 350px; z-index: 10; border-radius: 1.25rem; border: 1px solid #1e293b; box-shadow: 0 0 25px rgba(99, 102, 241, 0.08); }
                .mapboxgl-ctrl-group button { width: 30px; height: 30px; }
                `}
            </style>

            <form onSubmit={submit} className="space-y-4" id="admin-register-form">
                {/* STEP 1: Credentials Panel */}
                <div id="step-1-panel" className={`space-y-5 transition-all duration-300 ${step === 1 ? 'block' : 'hidden'}`}>
                    <div className="mb-6 animate-slide-up stagger-1">
                        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-md">
                            🛡️ Administrative Authority
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif-custom mb-2">Register Admin Node</h2>
                        <p className="text-slate-400 text-sm font-medium">Request moderator privileges to secure local corridors.</p>
                    </div>

                    {/* Name */}
                    <div className="animate-slide-up stagger-2">
                        <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Admin Full Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                            className="w-full px-4.5 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all bg-slate-950/40 text-white text-sm placeholder-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                            placeholder="Admin Officer Name"
                        />
                        {errors.name && <div className="mt-2 text-sm text-red-400">{errors.name}</div>}
                    </div>

                    {/* Email Address */}
                    <div className="animate-slide-up stagger-2">
                        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Official Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            className="w-full px-4.5 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all bg-slate-950/40 text-white text-sm placeholder-slate-650 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                            placeholder="officer@safetynet.com"
                        />
                        {errors.email && <div className="mt-2 text-sm text-red-400">{errors.email}</div>}
                    </div>

                    {/* Neighborhood Name */}
                    <div className="animate-slide-up stagger-2">
                        <label htmlFor="neighborhood_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Neighborhood Name</label>
                        <input
                            id="neighborhood_name"
                            type="text"
                            name="neighborhood_name"
                            value={data.neighborhood_name}
                            onChange={e => setData('neighborhood_name', e.target.value)}
                            required
                            className="w-full px-4.5 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all bg-slate-950/40 text-white text-sm placeholder-slate-650 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                            placeholder="e.g. Greenwood Valley (or draw boundary to auto-fill)"
                        />
                        {errors.neighborhood_name && <div className="mt-2 text-sm text-red-400">{errors.neighborhood_name}</div>}
                    </div>

                    {/* Password */}
                    <div className="animate-slide-up stagger-2">
                        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Secret Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                            className="w-full px-4.5 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all bg-slate-950/40 text-white text-sm placeholder-slate-650 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                            placeholder="Create a strong password"
                        />
                        {errors.password && <div className="mt-2 text-sm text-red-400">{errors.password}</div>}
                    </div>

                    <div className="pt-4 border-t border-slate-900 animate-slide-up stagger-3">
                        <button type="button" onClick={nextStep} className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_30px_rgba(99,102,241,0.45)] flex items-center justify-center gap-2 active:scale-[0.98] text-sm uppercase tracking-wider">
                            Select Map Region on Map ➡️
                        </button>
                    </div>

                    <div className="mt-6 text-center text-xs text-slate-500 animate-slide-up stagger-3">
                        Registering as a regular resident?{' '}
                        <Link href={route('register')} className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Resident Signup</Link>
                    </div>
                </div>

                {/* STEP 2: Map Selection Panel */}
                <div id="step-2-panel" className={`space-y-5 transition-all duration-300 ${step === 2 ? 'block' : 'hidden'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <button type="button" onClick={prevStep} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-850/80 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition shadow-md border border-slate-800">
                            ⬅️ Back to Details
                        </button>
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-950/50 border border-indigo-850 px-2 py-0.5 rounded-md">Step 2 of 2</div>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-2xl font-bold text-white font-serif-custom mb-1">🏡 Outline Neighborhood Region</h3>
                        <p className="text-xs text-slate-400">Define the geographical boundary territory that you will moderate.</p>
                    </div>

                    <div className="border border-slate-800 bg-slate-950/20 p-4.5 rounded-2xl space-y-4 shadow-inner">
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Region Boundary Selector</label>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={triggerDraw} className="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 border border-indigo-850/50 shadow-sm uppercase tracking-wider">
                                    ✏️ Draw
                                </button>
                                <button type="button" onClick={clearDraw} className="px-3 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 border border-rose-900/40 shadow-sm uppercase tracking-wider">
                                    🗑️ Reset
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-[11px] text-slate-500 leading-relaxed">Click <strong>Draw</strong>, then click corners on the map to outline your region boundary. Double-click the last point to close and lock the shape.</p>
                        
                        <div className="relative mb-3">
                            <div id="map" ref={mapContainer} className="w-full border border-slate-800 shadow-sm"></div>
                            <button
                                type="button"
                                onClick={toggle3D}
                                className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 transition"
                            >
                                {is3D ? '🗺️ 2D' : '🏙️ 3D View'}
                            </button>
                        </div>
                        
                        <input type="hidden" name="neighborhood_boundary" value={data.neighborhood_boundary} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="neighborhood_lat" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Calculated Center Lat</label>
                                <input id="neighborhood_lat" type="text" name="neighborhood_lat" value={data.neighborhood_lat} readOnly required
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-350 outline-none text-xs font-semibold shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]" 
                                    placeholder="Draw Area On Map" />
                            </div>
                            <div>
                                <label htmlFor="neighborhood_lng" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Calculated Center Lng</label>
                                <input id="neighborhood_lng" type="text" name="neighborhood_lng" value={data.neighborhood_lng} readOnly required
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-350 outline-none text-xs font-semibold shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]" 
                                    placeholder="Draw Area On Map" />
                            </div>
                        </div>
                        {errors.neighborhood_lat && <div className="mt-2 text-xs text-red-400">{errors.neighborhood_lat}</div>}
                    </div>

                    <div className="pt-4 border-t border-slate-900">
                        <button type="submit" disabled={processing} className={`w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_30px_rgba(99,102,241,0.45)] flex items-center justify-center gap-2 active:scale-[0.98] group text-sm uppercase tracking-wider ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Submit Admin Request
                        </button>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}

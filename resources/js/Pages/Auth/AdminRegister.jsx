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
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const drawRef = useRef(null);

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
            pitch: 10
        });

        mapRef.current = map;
        map.addControl(new window.maplibregl.NavigationControl());

        const geolocate = new window.maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserLocation: true
        });
        map.addControl(geolocate);

        map.on('load', () => geolocate.trigger());

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
                #map { height: 350px; z-index: 10; border-radius: 1.25rem; }
                .mapboxgl-ctrl-group button { width: 30px; height: 30px; }
                `}
            </style>

            <form onSubmit={submit} className="space-y-4" id="admin-register-form">
                {/* STEP 1: Credentials Panel */}
                <div id="step-1-panel" className={`space-y-4 transition-all duration-300 ${step === 1 ? 'block' : 'hidden'}`}>
                    <div className="mb-6">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                            🛡️ Administrative Authority
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 font-serif-custom mb-2">Register Admin Node</h2>
                        <p className="text-slate-500 text-sm">Request moderator privileges to secure local corridors.</p>
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1.5">Admin Full Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white text-sm"
                            placeholder="Admin Officer Name"
                        />
                        {errors.name && <div className="mt-1 text-xs text-red-600">{errors.name}</div>}
                    </div>

                    {/* Email Address */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">Official Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white text-sm"
                            placeholder="officer@safetynet.com"
                        />
                        {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email}</div>}
                    </div>

                    {/* Neighborhood Name */}
                    <div>
                        <label htmlFor="neighborhood_name" className="block text-sm font-bold text-slate-700 mb-1.5">Neighborhood Name</label>
                        <input
                            id="neighborhood_name"
                            type="text"
                            name="neighborhood_name"
                            value={data.neighborhood_name}
                            onChange={e => setData('neighborhood_name', e.target.value)}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white text-sm"
                            placeholder="e.g. Greenwood Valley (or draw boundary to auto-fill)"
                        />
                        {errors.neighborhood_name && <div className="mt-1 text-xs text-red-600">{errors.neighborhood_name}</div>}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1.5">Secret Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white text-sm"
                            placeholder="Create a strong password"
                        />
                        {errors.password && <div className="mt-1 text-xs text-red-600">{errors.password}</div>}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <button type="button" onClick={nextStep} className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 active:scale-[0.98] text-sm uppercase tracking-wider">
                            Select Map Region on Map ➡️
                        </button>
                    </div>

                    <div className="mt-6 text-center text-xs text-slate-600">
                        Registering as a regular resident?{' '}
                        <Link href={route('register')} className="font-bold text-slate-900 hover:text-slate-800 transition-colors">Resident Signup</Link>
                    </div>
                </div>

                {/* STEP 2: Map Selection Panel */}
                <div id="step-2-panel" className={`space-y-4 transition-all duration-300 ${step === 2 ? 'block' : 'hidden'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <button type="button" onClick={prevStep} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition shadow-sm border border-slate-200/50">
                            ⬅️ Back to Details
                        </button>
                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">Step 2 of 2</div>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-2xl font-bold text-slate-900 font-serif-custom">🏡 Outline Neighborhood Region</h3>
                        <p className="text-xs text-slate-500">Define the geographical boundary territory that you will moderate.</p>
                    </div>

                    <div className="border border-indigo-50 bg-indigo-50/20 p-4 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-bold text-slate-700">Region Boundary Selector</label>
                            <div className="flex items-center gap-1.5">
                                <button type="button" onClick={triggerDraw} className="px-2.5 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 border border-indigo-200 shadow-sm uppercase tracking-wider">
                                    ✏️ Draw
                                </button>
                                <button type="button" onClick={clearDraw} className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 border border-rose-100 shadow-sm uppercase tracking-wider">
                                    🗑️ Reset
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-[11px] text-slate-400">Click <strong>Draw</strong>, then click corners on the map to outline your region boundary. Double-click the last point to close and lock the shape.</p>
                        
                        <div id="map" ref={mapContainer} className="w-full border border-slate-200 shadow-sm mb-3"></div>
                        
                        <input type="hidden" name="neighborhood_boundary" value={data.neighborhood_boundary} />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="neighborhood_lat" className="block text-[10px] font-bold text-slate-500 mb-1">Calculated Center Lat</label>
                                <input id="neighborhood_lat" type="text" name="neighborhood_lat" value={data.neighborhood_lat} readOnly required
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none text-xs font-semibold" 
                                    placeholder="Draw Area On Map" />
                            </div>
                            <div>
                                <label htmlFor="neighborhood_lng" className="block text-[10px] font-bold text-slate-500 mb-1">Calculated Center Lng</label>
                                <input id="neighborhood_lng" type="text" name="neighborhood_lng" value={data.neighborhood_lng} readOnly required
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none text-xs font-semibold" 
                                    placeholder="Draw Area On Map" />
                            </div>
                        </div>
                        {errors.neighborhood_lat && <div className="mt-1 text-xs text-red-600">{errors.neighborhood_lat}</div>}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <button type="submit" disabled={processing} className={`w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 active:scale-[0.98] group text-sm uppercase tracking-wider ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}>
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

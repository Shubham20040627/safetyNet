@extends('layouts.app')

@section('header_title', 'Report an Incident')

@section('content')
@push('styles')
    <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
    <style>
        #map { height: 350px; z-index: 10; border-radius: 0.5rem; }
    </style>
@endpush

<div class="max-w-3xl mx-auto">
    <div class="bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-800">Submit a New Report</h2>
            <p class="text-gray-500 mt-1">Provide accurate details to help community safety officers.</p>
        </div>

        <form action="{{ route('reports.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
            @csrf

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Title -->
                <div class="md:col-span-2">
                    <label for="title" class="block text-sm font-semibold text-gray-700 mb-2">Incident Title</label>
                    <input type="text" name="title" id="title" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" placeholder="e.g., Suspicious activity near Park Avenue" required>
                    @error('title') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Type -->
                <div>
                    <label for="type" class="block text-sm font-semibold text-gray-700 mb-2">Incident Type</label>
                    <select name="type" id="type" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" required>
                        <option value="">Select Type</option>
                        <option value="crime">Crime</option>
                        <option value="accident">Accident</option>
                        <option value="suspicious">Suspicious Activity</option>
                        <option value="other">Other</option>
                    </select>
                    @error('type') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Date & Time -->
                <div>
                    <label for="datetime" class="block text-sm font-semibold text-gray-700 mb-2">Date & Time</label>
                    <input type="datetime-local" name="datetime" id="datetime" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" required>
                    @error('datetime') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Location -->
                <div class="md:col-span-2">
                    <label for="location" class="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input type="text" name="location" id="location" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" placeholder="Enter street name or landmark" required>
                    @error('location') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    
                    <p class="text-xs text-gray-500 mt-3 mb-1">Click on the map to drop a pin, OR type the coordinates below.</p>
                    <div id="map" class="w-full border border-gray-300 shadow-sm mb-4"></div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="latitude" class="block text-sm font-semibold text-gray-700 mb-2">Latitude</label>
                            <input type="text" name="latitude" id="latitude" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" placeholder="e.g. 40.7128">
                        </div>
                        <div>
                            <label for="longitude" class="block text-sm font-semibold text-gray-700 mb-2">Longitude</label>
                            <input type="text" name="longitude" id="longitude" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" placeholder="e.g. -74.0060">
                        </div>
                    </div>
                </div>

                <!-- Description -->
                <div class="md:col-span-2">
                    <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea name="description" id="description" rows="4" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" placeholder="Describe the incident in detail..." required></textarea>
                    @error('description') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Image Upload -->
                <div class="md:col-span-2">
                    <label for="image" class="block text-sm font-semibold text-gray-700 mb-2">Upload Image (Optional)</label>
                    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors cursor-pointer group">
                        <div class="space-y-1 text-center">
                            <svg class="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div class="flex text-sm text-gray-600">
                                <label for="image" class="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input id="image" name="image" type="file" class="sr-only">
                                </label>
                                <p class="pl-1">or drag and drop</p>
                            </div>
                            <p class="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                        </div>
                    </div>
                    @error('image') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
            </div>

            <div class="pt-4 flex justify-end gap-4">
                <a href="{{ route('dashboard') }}" class="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">Cancel</a>
                <button type="submit" class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 active:translate-y-0">
                    Submit Report
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
    <!-- Import MapLibre GL JS -->
    <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            // Initialize MapLibre Map with Google Streets style using your MapTiler Key
            var map = new maplibregl.Map({
                container: 'map',
                style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=lRaklM4419f17ZLKAjhl', 
                center: [-74.0060, 40.7128], // [Lng, Lat] default New York
                zoom: 13,
                pitch: 45, // Tilted 3D perspective by default
                bearing: -17.6
            });

            // Add smooth navigation controls
            map.addControl(new maplibregl.NavigationControl());

            // Add geolocate control (User Location blue dot + target button)
            var geolocate = new maplibregl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true,
                showUserLocation: true
            });
            map.addControl(geolocate);

            // Automatically geolocate on load
            map.on('load', function() {
                geolocate.trigger();
            });

            // Enable 3D Buildings on load when zooming in close
            map.on('load', function () {
                var layers = map.getStyle().layers;
                var labelLayerId;
                for (var i = 0; i < layers.length; i++) {
                    if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                        labelLayerId = layers[i].id;
                        break;
                    }
                }

                map.addLayer({
                    'id': '3d-buildings',
                    'source': 'openmaptiles',
                    'source-layer': 'building',
                    'type': 'fill-extrusion',
                    'minzoom': 14,
                    'paint': {
                        'fill-extrusion-color': '#e2e8f0',
                        'fill-extrusion-height': [
                            'interpolate', ['linear'], ['zoom'],
                            14, 0,
                            14.5, ['get', 'render_height']
                        ],
                        'fill-extrusion-base': [
                            'interpolate', ['linear'], ['zoom'],
                            14, 0,
                            14.5, ['get', 'render_min_height']
                        ],
                        'fill-extrusion-opacity': 0.8
                    }
                }, labelLayerId);
            });

            var marker;
            var latInput = document.getElementById('latitude');
            var lngInput = document.getElementById('longitude');

            // Function to get address from coordinates (Reverse Geocoding)
            function getAddressFromCoords(lat, lng) {
                var locationInput = document.getElementById('location');
                locationInput.placeholder = "Finding address...";
                
                fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
                    .then(response => response.json())
                    .then(data => {
                        if(data.display_name) {
                            // Extract a shorter, friendlier address if possible, otherwise use full
                            var address = data.address;
                            var shortAddress = "";
                            if(address.road) shortAddress += address.road;
                            if(address.suburb || address.city || address.town || address.village) {
                                shortAddress += (shortAddress ? ", " : "") + (address.suburb || address.city || address.town || address.village);
                            }
                            
                            locationInput.value = shortAddress || data.display_name;
                        }
                    })
                    .catch(error => {
                        console.error("Geocoding failed:", error);
                        locationInput.placeholder = "Could not find address automatically";
                    });
            }

            // When clicking the map
            map.on('click', function(e) {
                var lat = e.lngLat.lat.toFixed(6);
                var lng = e.lngLat.lng.toFixed(6);

                if (marker) {
                    marker.setLngLat([lng, lat]);
                } else {
                    marker = new maplibregl.Marker({ color: "#ef4444" })
                        .setLngLat([lng, lat])
                        .addTo(map);
                }

                latInput.value = lat;
                lngInput.value = lng;
                
                // Automatically fetch and fill the location text box!
                getAddressFromCoords(lat, lng);
            });

            // When typing in the latitude/longitude boxes
            let timeoutId;
            function updateMapFromInputs() {
                var lat = parseFloat(latInput.value);
                var lng = parseFloat(lngInput.value);

                if (!isNaN(lat) && !isNaN(lng)) {
                    if (marker) {
                        marker.setLngLat([lng, lat]);
                    } else {
                        marker = new maplibregl.Marker({ color: "#ef4444" })
                            .setLngLat([lng, lat])
                            .addTo(map);
                    }
                    map.setCenter([lng, lat]);
                    map.setZoom(15); // Zoom into the typed location
                    
                    // Add a small delay so we don't spam the API while typing
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        getAddressFromCoords(lat, lng);
                    }, 800);
                }
            }

            latInput.addEventListener('input', updateMapFromInputs);
            lngInput.addEventListener('input', updateMapFromInputs);
            
            // User location is now automatically geolocated and centered via GeolocateControl above.
        });
    </script>
@endpush

@endsection

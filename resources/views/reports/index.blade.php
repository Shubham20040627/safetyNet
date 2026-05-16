@extends('layouts.app')

@section('header_title', 'All Incident Reports')

@section('content')
@push('styles')
    <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
    <style>
        #global-map { height: 400px; z-index: 10; border-radius: 0.75rem; }
    </style>
@endpush

<div class="space-y-6">
    <!-- Filters and Search -->
    <div class="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <form action="{{ route('reports.index') }}" method="GET" class="flex flex-wrap items-center gap-4">
            <div class="flex-1 min-w-[200px]">
                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input type="text" name="search" value="{{ request('search') }}" placeholder="Search by location..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition">
                </div>
            </div>

            <div class="w-full md:w-48">
                <select name="type" onchange="this.form.submit()" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition">
                    <option value="">All Types</option>
                    <option value="crime" {{ request('type') == 'crime' ? 'selected' : '' }}>Crime</option>
                    <option value="accident" {{ request('type') == 'accident' ? 'selected' : '' }}>Accident</option>
                    <option value="suspicious" {{ request('type') == 'suspicious' ? 'selected' : '' }}>Suspicious</option>
                    <option value="other" {{ request('type') == 'other' ? 'selected' : '' }}>Other</option>
                </select>
            </div>

            <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
                Filter
            </button>
            
            <button type="button" onclick="findNearMe(event)" class="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                Near Me (5km)
            </button>
            
            @if(request()->has('search') || request()->has('type') || request()->has('lat'))
                <a href="{{ route('reports.index') }}" class="text-sm text-gray-500 hover:text-indigo-600 font-medium underline">Clear filters</a>
            @endif
        </form>

        @if(request()->has('lat'))
            <div class="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center justify-between">
                <span class="flex items-center gap-2 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                    Showing incidents within 5km of your location.
                </span>
                <a href="{{ route('reports.index') }}" class="font-bold hover:underline">Clear</a>
            </div>
        @endif
    </div>
    <!-- Global Incidents Map -->
    <div class="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-3">Incident Map View</h3>
        <div id="global-map" class="w-full border border-gray-200"></div>
    </div>

    <!-- Reports Grid -->
    @if($reports->isEmpty())
        <div class="bg-white p-20 rounded-xl shadow-md text-center">
            <div class="mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">No reports available</h3>
            <p class="text-gray-500 mt-2">No incidents have been reported in this category or location.</p>
            <a href="{{ route('reports.create') }}" class="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md">
                Report an Incident
            </a>
        </div>
    @else
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach($reports as $report)
                <div class="bg-white rounded-xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden border border-gray-100 flex flex-col">
                    @if($report->image)
                        <img src="{{ asset('storage/' . $report->image) }}" alt="{{ $report->title }}" class="h-48 w-full object-cover">
                    @else
                        <div class="h-48 bg-gray-100 flex items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    @endif

                    <div class="p-6 flex-1 flex flex-col">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider
                                {{ $report->type == 'crime' ? 'bg-red-100 text-red-600' : '' }}
                                {{ $report->type == 'accident' ? 'bg-yellow-100 text-yellow-600' : '' }}
                                {{ $report->type == 'suspicious' ? 'bg-purple-100 text-purple-600' : '' }}
                                {{ $report->type == 'other' ? 'bg-gray-100 text-gray-600' : '' }}">
                                {{ $report->type }}
                            </span>
                            <span class="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider 
                                {{ $report->status == 'resolved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600' }}">
                                {{ $report->status }}
                            </span>
                        </div>

                        <h3 class="text-lg font-bold text-gray-800 line-clamp-1 mb-2 hover:text-indigo-600 transition">
                            <a href="{{ route('reports.show', $report) }}">{{ $report->title }}</a>
                        </h3>
                        <p class="text-sm text-gray-600 line-clamp-3 mb-4">{{ $report->description }}</p>

                        <div class="mt-auto space-y-2 border-t pt-4">
                            <div class="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {{ $report->location }}
                            </div>
                            <div class="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {{ \Carbon\Carbon::parse($report->datetime)->format('M d, Y - h:i A') }}
                            </div>
                            <div class="flex items-center justify-between gap-2 text-xs text-gray-400">
                                <div>Reported by: <span class="font-bold text-gray-600">{{ $report->user->name }}</span></div>
                                <a href="{{ route('reports.show', $report) }}" class="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 transition">
                                    Details
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-8">
            {{ $reports->links() }}
        </div>
    @endif
</div>

@push('scripts')
    <!-- Import MapLibre GL JS -->
    <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
    <script>
        function findNearMe(event) {
            if (navigator.geolocation) {
                var btn = event.currentTarget;
                var originalText = btn.innerHTML;
                btn.innerHTML = '<svg class="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Locating...';
                
                navigator.geolocation.getCurrentPosition(function(position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    var currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('lat', lat);
                    currentUrl.searchParams.set('lng', lng);
                    window.location.href = currentUrl.toString();
                }, function(error) {
                    alert("Could not get your location. Please make sure location services are enabled.");
                    btn.innerHTML = originalText;
                });
            } else {
                alert("Geolocation is not supported by your browser.");
            }
        }

        document.addEventListener('DOMContentLoaded', function () {
            // Get reports data from backend
            var reports = @json($reports->items());

            // Initialize MapLibre Map with Google Streets style using your MapTiler Key
            var map = new maplibregl.Map({
                container: 'global-map',
                style: 'https://api.maptiler.com/maps/streets-v2/style.json?key={{ config('services.maptiler.key') }}', 
                center: [-74.0060, 40.7128], // [Lng, Lat] default New York
                zoom: 12,
                pitch: 45, // Tilted 3D perspective by default
                bearing: -17.6
            });

            // Add smooth navigation controls (zoom buttons)
            map.addControl(new maplibregl.NavigationControl());

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

            var bounds = new maplibregl.LngLatBounds();
            var hasCoords = false;

            // Loop and add pins to map
            reports.forEach(function(report) {
                if (report.latitude && report.longitude) {
                    var lat = parseFloat(report.latitude);
                    var lng = parseFloat(report.longitude);
                    
                    var typeColors = {
                        'crime': '#ef4444',      // Red
                        'accident': '#f59e0b',   // Amber
                        'suspicious': '#8b5cf6', // Purple
                        'other': '#6b7280'       // Gray
                    };
                    var markerColor = typeColors[report.type] || '#6b7280';

                    var showUrl = "{{ route('reports.show', ':id') }}".replace(':id', report.id);
                    var popupContent = `
                        <div class="p-1 min-w-[200px]">
                            <div class="text-xs font-bold uppercase mb-1" style="color: ${markerColor}">${report.type}</div>
                            <h4 class="font-bold text-gray-800 text-sm mb-1 hover:text-indigo-600 transition">
                                <a href="${showUrl}">${report.title}</a>
                            </h4>
                            <p class="text-xs text-gray-600 mb-2">${report.description.substring(0, 80)}${report.description.length > 80 ? '...' : ''}</p>
                            <a href="${showUrl}" class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                                View Details
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    `;

                    // Create interactive Popup
                    var popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

                    // Add custom-colored 3D pin to map
                    new maplibregl.Marker({ color: markerColor })
                        .setLngLat([lng, lat]) // Note: Lng, Lat order
                        .setPopup(popup)
                        .addTo(map);

                    bounds.extend([lng, lat]);
                    hasCoords = true;
                }
            });

            // Auto center map onto all reports
            if (hasCoords) {
                map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
            }
        });
    </script>
@endpush

@endsection

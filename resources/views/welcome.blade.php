<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>SafetyNet - Community Driven Security</title>
        
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&family=merriweather:300,400,700&display=swap" rel="stylesheet" />
        
        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        
        <style>
            .font-serif-custom { font-family: 'Merriweather', serif; }
        </style>
    </head>
    <body class="font-sans antialiased bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
        
        <!-- Navbar -->
        <header class="absolute w-full top-0 z-50">
            <div class="max-w-7xl mx-auto px-6 lg:px-8 h-24 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <span class="text-2xl font-bold tracking-tight text-slate-900">SafetyNet.</span>
                </div>

                <div class="flex items-center gap-6">
                    @if (Route::has('login'))
                        @auth
                            <a href="{{ url('/dashboard') }}" class="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors">Dashboard</a>
                        @else
                            <a href="{{ route('login') }}" class="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">Log in</a>
                            @if (Route::has('register'))
                                <a href="{{ route('register') }}" class="text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-6 py-3 rounded-full transition-all shadow-md hover:shadow-xl">Get Started</a>
                            @endif
                        @endauth
                    @endif
                </div>
            </div>
        </header>

        <main>
            <!-- Hero Section (Split Screen) -->
            <div class="relative min-h-screen flex flex-col lg:flex-row">
                
                <!-- Left Content -->
                <div class="w-full lg:w-[55%] flex flex-col justify-center px-6 lg:px-20 xl:px-32 pt-40 lg:pt-48 pb-20 lg:py-24 z-10 bg-white">
                    <div class="max-w-2xl">

                        
                        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-8 leading-[1.1] font-serif-custom">
                            Protect your <br> neighborhood, <br> <span class="italic text-indigo-700">together.</span>
                        </h1>
                        
                        <p class="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-lg border-l-4 border-slate-900 pl-6">
                            A highly vetted, localized network for reporting incidents, viewing real-time safety heatmaps, and building a secure environment for your family.
                        </p>
                        
                        <div class="flex flex-col sm:flex-row gap-4">
                            <a href="{{ route('register') }}" class="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all text-center">
                                Join the Network
                            </a>
                            <a href="#features" class="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg border-2 border-slate-200 hover:border-slate-900 transition-all text-center">
                                How it works
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Right Image -->
                <div class="w-full lg:w-[45%] lg:absolute lg:top-0 lg:right-0 lg:bottom-0 h-[60vh] lg:h-screen">
                    <img src="https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=2070&auto=format&fit=crop" 
                         alt="Peaceful Neighborhood" 
                         class="w-full h-full object-cover rounded-tl-[100px] lg:rounded-l-[100px] lg:rounded-tr-none shadow-2xl">
                </div>
            </div>

            <!-- Features Section (Editorial Alternating Layout) -->
            <div id="features" class="py-24 bg-slate-50 border-t border-slate-100">
                <div class="max-w-7xl mx-auto px-6 lg:px-8 space-y-32">
                    
                    <div class="text-center max-w-2xl mx-auto mb-20">
                        <h2 class="text-4xl font-bold text-slate-900 font-serif-custom mb-6">Engineered for real-world impact.</h2>
                        <p class="text-lg text-slate-600">A clean, hand-crafted set of specialized tools built to keep families informed, verified, and safe.</p>
                    </div>

                    <!-- Feature 1: Geolocation -->
                    <div class="flex flex-col lg:flex-row items-center gap-16">
                        <div class="w-full lg:w-1/2">
                            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-6">
                                Geospatial Intelligence
                            </div>
                            <h3 class="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-custom mb-6">"Near Me" Proximity Detection</h3>
                            <p class="text-lg text-slate-600 leading-relaxed mb-6">
                                Harnessing the **Haversine Formula** at the database layer, SafetyNet calculates the exact physical distance down to the meter between you and any reported incident. 
                            </p>
                            <p class="text-slate-500 leading-relaxed">
                                Simply click the "Near Me" button to instantly filter out everything beyond a 5-kilometer radius using your browser's physical GPS coordinates.
                            </p>
                        </div>
                        <div class="w-full lg:w-1/2 flex justify-center">
                            <div class="w-full max-w-md p-8 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-100 relative overflow-hidden">
                                <div class="absolute inset-0 bg-slate-50/50 flex items-center justify-center">
                                    <div class="w-48 h-48 border-2 border-dashed border-indigo-500/20 rounded-full flex items-center justify-center animate-pulse">
                                        <div class="w-32 h-32 border-2 border-dashed border-indigo-500/40 rounded-full flex items-center justify-center">
                                            <div class="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center">
                                                <span class="w-4 h-4 bg-indigo-600 rounded-full animate-ping"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="relative z-10 flex flex-col justify-between h-48 text-center">
                                    <span class="text-xs font-bold uppercase tracking-widest text-indigo-600">Active Radar</span>
                                    <span class="text-2xl font-bold text-slate-900">5km Safe Zone</span>
                                    <span class="text-xs text-slate-400">Scanning real-time coordinates</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 2: Heatmap Density -->
                    <div class="flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div class="w-full lg:w-1/2">
                            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-6">
                                Visual Analysis
                            </div>
                            <h3 class="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-custom mb-6">Density Hotspot Heatmaps</h3>
                            <p class="text-lg text-slate-600 leading-relaxed mb-6">
                                Visualize clusters of neighborhood incidents instantly. Built with `leaflet.heat` and Esri World Imagery (Satellite maps) to overlay physical geography with safety reports.
                            </p>
                            <p class="text-slate-500 leading-relaxed">
                                Toggle easily between standard pins and glowing density zones to see which intersections or corridors require heightened local attention.
                            </p>
                        </div>
                        <div class="w-full lg:w-1/2 flex justify-center">
                            <div class="w-full max-w-md p-8 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-100 relative overflow-hidden">
                                <div class="absolute inset-0 bg-slate-900/5 flex flex-col justify-between p-6">
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs font-bold text-slate-500">Esri Imagery</span>
                                        <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                    </div>
                                    <div class="flex justify-center items-center gap-2">
                                        <div class="w-12 h-12 rounded-full bg-red-500/40 blur-md animate-pulse"></div>
                                        <div class="w-16 h-16 rounded-full bg-red-600/30 blur-lg"></div>
                                        <div class="w-8 h-8 rounded-full bg-red-400/50 blur-sm"></div>
                                    </div>
                                    <div class="flex justify-between items-center text-xs text-slate-400">
                                        <span>Scale: High Density</span>
                                        <span>98.4% Accuracy</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 3: Analytics -->
                    <div class="flex flex-col lg:flex-row items-center gap-16">
                        <div class="w-full lg:w-1/2">
                            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-6">
                                Administrative Tools
                            </div>
                            <h3 class="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-custom mb-6">Executive Command Center</h3>
                            <p class="text-lg text-slate-600 leading-relaxed mb-6">
                                Aggregated and actionable data for community leaders. Automatically groups all local incidents by type and resolution status using SQL database grouping algorithms.
                            </p>
                            <p class="text-slate-500 leading-relaxed">
                                Beautifully presented via integrated Chart.js doughnut and bar graphs, providing quick intelligence on resolution rates and category distributions.
                            </p>
                        </div>
                        <div class="w-full lg:w-1/2 flex justify-center">
                            <div class="w-full max-w-md p-8 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-100">
                                <div class="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                                    <span class="text-sm font-bold text-slate-800 font-serif-custom">Monthly Breakdown</span>
                                    <span class="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 font-semibold">Live Data</span>
                                </div>
                                <div class="space-y-4">
                                    <div>
                                        <div class="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                                            <span>Crimes Resolved</span>
                                            <span>84%</span>
                                        </div>
                                        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div class="h-full bg-indigo-600 rounded-full" style="width: 84%"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                                            <span>Pending Investigations</span>
                                            <span>16%</span>
                                        </div>
                                        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div class="h-full bg-slate-300 rounded-full" style="width: 16%"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                                            <span>Resolved Traffic Accidents</span>
                                            <span>100%</span>
                                        </div>
                                        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div class="h-full bg-green-500 rounded-full" style="width: 100%"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <!-- Footer -->
            <footer class="bg-slate-900 text-white py-12">
                <div class="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div class="flex items-center gap-2 mb-4 md:mb-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        <span class="text-xl font-bold">SafetyNet</span>
                    </div>
                    <p class="text-slate-400 text-sm">© {{ date('Y') }} SafetyNet. A bespoke civic project.</p>
                </div>
            </footer>
        </main>
    </body>
</html>

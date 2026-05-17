<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Neighborhood Safety') }}</title>

        <!-- Fonts (Preconnected for 3x faster loading) -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

        <!-- Real-time Initialization (Pre-compiled local Tailwind CSS & Alpine JS bundle) -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])

        @stack('styles')

        <style>
            body {
                font-family: 'Inter', sans-serif;
            }
            .glass-sidebar {
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
            }
            /* Ultra-premium custom thin scrollbar for sidebar */
            .glass-sidebar::-webkit-scrollbar {
                width: 5px;
            }
            .glass-sidebar::-webkit-scrollbar-track {
                background: transparent;
            }
            .glass-sidebar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.15);
                border-radius: 10px;
            }
            .glass-sidebar::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            .glass-header {
                background: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
            }
            .dashboard-bg {
                position: fixed;
                inset: 0;
                z-index: -1;
                background: linear-gradient(rgba(241, 245, 249, 0.9), rgba(241, 245, 249, 0.9)), 
                            url('https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=2070');
                background-size: cover;
                background-position: center;
                filter: blur(60px);
                transform: scale(1.1);
            }
        </style>
    </head>
    <body class="bg-slate-50 text-gray-900 antialiased">
        <div class="dashboard-bg"></div>

        <div x-data="{ mobileMenuOpen: false, sidebarHovered: false }" class="min-h-screen flex overflow-x-hidden">
            <!-- Mobile Sidebar Overlay -->
            <div x-show="mobileMenuOpen" 
                 x-transition:enter="transition ease-out duration-300"
                 x-transition:enter-start="opacity-0"
                 x-transition:enter-end="opacity-100"
                 x-transition:leave="transition ease-in duration-200"
                 x-transition:leave-start="opacity-100"
                 x-transition:leave-end="opacity-0"
                 @click="mobileMenuOpen = false"
                 class="fixed inset-0 bg-gray-900/50 z-40 md:hidden" 
                 style="display: none;"></div>

            <!-- Mobile Sidebar Content -->
            <div x-show="mobileMenuOpen"
                 x-transition:enter="transition ease-out duration-300 transform"
                 x-transition:enter-start="-translate-x-full"
                 x-transition:enter-end="translate-x-0"
                 x-transition:leave="transition ease-in duration-200 transform"
                 x-transition:leave-start="translate-x-0"
                 x-transition:leave-end="-translate-x-full"
                 class="fixed inset-y-0 left-0 w-64 bg-slate-950 text-white z-50 shadow-2xl md:hidden overflow-y-auto"
                 style="display: none;">
                <div class="p-6 flex items-center justify-between border-b border-slate-800">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 bg-white text-slate-950 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <span class="text-xl font-bold tracking-tight text-white">SafetyNet</span>
                    </div>
                    <button @click="mobileMenuOpen = false" class="p-1 rounded-lg hover:bg-slate-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <nav class="mt-6 px-4">
                    @if(auth()->user()->role !== 'super_admin')
                    <a href="{{ route('dashboard') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('dashboard') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a11 11 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </a>
                    <a href="{{ route('announcements.list') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('announcements.list') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                        Notices
                    </a>
                    <a href="{{ route('reports.index') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('reports.index') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        All Reports
                    </a>
                    <a href="{{ route('reports.create') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('reports.create') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Report Incident
                    </a>
                    <a href="{{ route('reports.my-reports') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('reports.my-reports') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Reports
                    </a>
                    @endif
 
                    @if(auth()->user()->role === 'responder' || auth()->user()->role === 'admin')
                    <a href="{{ route('reports.assignments') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('reports.assignments') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                        </svg>
                        {{ auth()->user()->role === 'admin' ? 'Active Dispatches' : 'My Assignments' }}
                    </a>
                    @endif

                    @if(auth()->user()->role === 'admin')
                        <div class="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Panel</div>
                        <a href="{{ route('admin.analytics') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('admin.analytics') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Security Analytics
                        </a>
                        <a href="{{ route('admin.users') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('admin.users') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Manage Users
                        </a>
                        <a href="{{ route('admin.reports') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('admin.reports') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Manage Reports
                        </a>
                        <a href="{{ route('admin.announcements.index') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('admin.announcements.*') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            Announcements
                        </a>
                    @endif

                    @if(auth()->user()->role === 'super_admin')
                        <div class="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Super Admin</div>
                        <a href="{{ route('superadmin.dashboard') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('superadmin.dashboard') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Master Control
                        </a>
                    @endif
                </nav>
            </div>
 
            <!-- Desktop Hover Sidebar -->
            <div @mouseenter="sidebarHovered = true" 
                 @mouseleave="sidebarHovered = false"
                 :class="sidebarHovered ? 'translate-x-0' : '-translate-x-full'"
                 class="fixed top-0 left-0 h-screen w-64 glass-sidebar text-white z-50 shadow-2xl border-r border-white/10 transition-transform duration-300 ease-in-out hidden md:block transform -translate-x-full overflow-y-auto">
                <div class="p-6 border-b border-slate-800">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <span class="text-2xl font-black tracking-tight text-white">SafetyNet</span>
                    </div>
                </div>
                
                <nav class="mt-6 px-4">
                    @if(auth()->user()->role !== 'super_admin')
                    <a href="{{ route('dashboard') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('dashboard') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a11 11 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </a>
                    <a href="{{ route('announcements.list') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('announcements.list') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                        Community Notices
                    </a>
                    
                    <a href="{{ route('reports.heatmap') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('reports.heatmap') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Security Heatmap
                    </a>
                    
                    <a href="{{ route('reports.index') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('reports.index') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        All Reports
                    </a>
 
                    <a href="{{ route('reports.create') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('reports.create') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Report Incident
                    </a>
 
                    <a href="{{ route('reports.my-reports') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('reports.my-reports') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Reports
                    </a>
                    @endif
 
                    @if(auth()->user()->role === 'responder' || auth()->user()->role === 'admin')
                    <a href="{{ route('reports.assignments') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('reports.assignments') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                        </svg>
                        {{ auth()->user()->role === 'admin' ? 'Active Dispatches' : 'My Assignments' }}
                    </a>
                    @endif

                    @if(auth()->user()->role === 'admin')
                        <div class="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Admin Panel
                        </div>
                        <a href="{{ route('admin.analytics') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('admin.analytics') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Security Analytics
                        </a>
                        <a href="{{ route('admin.users') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('admin.users') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Manage Users
                        </a>
                        <a href="{{ route('admin.reports') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('admin.reports') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Manage Reports
                        </a>
                        <a href="{{ route('admin.announcements.index') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('admin.announcements.*') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            Announcements
                        </a>
                    @endif

                    @if(auth()->user()->role === 'super_admin')
                        <div class="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Super Admin</div>
                        <a href="{{ route('superadmin.dashboard') }}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition mb-2 {{ request()->routeIs('superadmin.dashboard') ? 'bg-slate-800 shadow-md font-bold' : 'text-slate-400 hover:text-white' }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Master Control
                        </a>
                    @endif
                </nav>
            </div>

            <div :class="sidebarHovered ? 'md:pl-64' : 'md:pl-0'" class="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
                <!-- Invisible Left Edge Activation Zone -->
                <div @mouseenter="sidebarHovered = true" class="fixed top-0 left-0 h-screen w-3.5 z-45 hidden md:block"></div>

                <!-- Top Navbar -->
                <header class="glass-header border-b border-white/20 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
                    <div class="flex items-center gap-4">
                        <button @click="mobileMenuOpen = true" class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <!-- Desktop Hover Sidebar Trigger (Three Dots) -->
                        <button @mouseenter="sidebarHovered = true" class="hidden md:flex p-2.5 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition shadow flex-shrink-0 items-center justify-center cursor-pointer border border-slate-700/50">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                        </button>

                        <div class="text-xl font-medium text-gray-700 truncate">
                            @yield('header_title', 'Dashboard')
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <!-- Pulsing SOS Trigger Button -->
                        @if(auth()->user()->role !== 'super_admin')
                            <button onclick="triggerSOSModal()" class="relative inline-flex items-center justify-center px-4 py-2 text-xs font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md hover:shadow-red-500/25 border border-red-500 animate-pulse">
                                <span class="absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75 animate-ping -top-1 -right-1"></span>
                                🚨 Emergency SOS
                            </button>
                        @endif

                        <span class="text-sm text-gray-600 font-medium hidden sm:inline">Hello, {{ auth()->user()->name }}</span>
                        <form method="POST" action="{{ route('logout') }}" class="m-0 p-0 flex items-center flex-shrink-0">
                            @csrf
                            <button type="submit" class="text-xs font-black uppercase tracking-widest text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 px-4 py-2 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap shadow-sm cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </form>
                    </div>
                </header>

                <!-- Flash Messages -->
                <div class="px-4 md:px-8 mt-6">
                    @if(session('success'))
                        <div class="bg-green-100 border border-green-200 text-green-700 p-4 rounded-xl shadow-sm flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                            {{ session('success') }}
                        </div>
                    @endif

                    @if(session('error'))
                        <div class="bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl shadow-sm flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                            {{ session('error') }}
                        </div>
                    @endif
                </div>

                <!-- Main Content -->
                <main class="p-4 md:p-8 flex-1">
                    @yield('content')
                </main>
            </div>
        </div>

        <!-- SOS Countdown Modal -->
        <div id="sos-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center hidden">
            <div class="bg-white p-8 rounded-2xl border border-red-100 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
                <div class="absolute -right-10 -top-10 w-40 h-40 bg-red-50 rounded-full -z-10 animate-pulse"></div>
                <div class="text-red-600 mb-4 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 class="text-2xl font-extrabold text-slate-900">Broadcasting SOS Alert</h3>
                <p class="text-slate-500 text-sm mt-2">Triggering neighborhood emergency panic signal in...</p>
                <div id="sos-countdown-text" class="text-7xl font-black text-red-600 my-6 animate-ping">3</div>
                <button onclick="cancelSOS()" class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-md">
                    Cancel Emergency
                </button>
            </div>
        </div>

        <!-- Flashing Emergency Broadcast Alert Banner -->
        <div id="emergency-alert-banner" class="fixed bottom-6 right-6 z-[100] max-w-md w-full bg-red-600 text-white rounded-2xl shadow-2xl border border-red-500 overflow-hidden transform translate-y-full transition-transform duration-500 ease-out">
            <div class="p-6 relative">
                <div class="absolute top-2 right-2">
                    <button onclick="dismissEmergencyBanner()" class="p-1 hover:bg-white/10 rounded-lg transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="flex items-start gap-4">
                    <div class="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <span class="text-xs font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Active Emergency</span>
                        <h4 class="text-lg font-black mt-1 leading-snug">
                            <span id="emergency-sender-name">Resident</span> needs urgent assistance!
                        </h4>
                        <p class="text-xs text-red-100 mt-1 leading-relaxed">
                            An SOS signal has been triggered. Please verify their location and offer immediate help.
                        </p>
                        <div class="mt-4 flex flex-wrap items-center gap-2">
                            <a id="emergency-location-map-btn" href="#" target="_blank" class="bg-white text-red-600 px-3.5 py-2 rounded-xl text-xs font-black shadow-md hover:bg-red-50 transition flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                                </svg>
                                Map
                            </a>
                            <button id="emergency-acknowledge-btn" onclick="acknowledgeActiveEmergency()" class="bg-amber-400 text-slate-900 px-3.5 py-2 rounded-xl text-xs font-black shadow-md hover:bg-amber-350 transition flex items-center gap-1">
                                🤝 Dispatch Help
                            </button>
                            <button id="emergency-resolve-btn" onclick="resolveActiveEmergency()" class="bg-red-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-red-900 transition border border-red-700 hidden">
                                Resolve Signal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="h-1.5 w-full bg-red-700/50 relative overflow-hidden">
                <div class="absolute h-full w-1/3 bg-white/80 animate-infinite-slide"></div>
            </div>
        </div>

        <!-- Sender's Floating SOS Status Tracker Card -->
        <div id="my-sos-tracker-card" class="fixed bottom-6 left-6 z-[100] max-w-sm w-full bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-2xl overflow-hidden transform translate-y-full transition-transform duration-500 ease-out hidden">
            <div class="flex items-start gap-4 relative z-10">
                <div id="my-sos-icon-container" class="h-12 w-12 bg-red-600/20 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div class="flex-1">
                    <h4 id="my-sos-title" class="text-base font-black">SOS Signal Active</h4>
                    <p id="my-sos-description" class="text-xs text-slate-400 mt-1 leading-relaxed font-medium">
                        Your emergency signal is active. Waiting for neighborhood dispatch response...
                    </p>
                    <div class="mt-4">
                        <button onclick="resolveOwnSOS()" class="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md hover:bg-red-700 transition">
                            Mark Safe & Resolve
                        </button>
                    </div>
                </div>
            </div>
            <div id="my-sos-card-bg" class="absolute -right-10 -top-10 w-40 h-40 bg-red-600/10 rounded-full transition-all duration-700"></div>
        </div>

        <style>
            @keyframes infiniteSlide {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            .animate-infinite-slide {
                animation: infiniteSlide 2s linear infinite;
            }
        </style>

        <script>
            let sosTimer = null;
            let countdownVal = 3;
            let activeAlarmInterval = null;
            let audioCtx = null;
            let activeBannerAlertId = null;
            let ownActiveAlertId = null;

            // Synthesize siren alarm audio using Web Audio API (Offline compatible)
            function playSiren() {
                if (activeAlarmInterval) return;
                try {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) {
                    console.error("Web Audio not supported", e);
                    return;
                }

                let toggle = false;
                activeAlarmInterval = setInterval(() => {
                    if (!audioCtx) return;
                    let osc = audioCtx.createOscillator();
                    let gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(toggle ? 880 : 550, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.35);
                    toggle = !toggle;
                }, 500);
            }

            function stopSiren() {
                if (activeAlarmInterval) {
                    clearInterval(activeAlarmInterval);
                    activeAlarmInterval = null;
                }
            }

            function triggerSOSModal() {
                document.getElementById('sos-modal').classList.remove('hidden');
                countdownVal = 3;
                document.getElementById('sos-countdown-text').innerText = countdownVal;
                
                sosTimer = setInterval(() => {
                    countdownVal--;
                    if (countdownVal <= 0) {
                        clearInterval(sosTimer);
                        document.getElementById('sos-modal').classList.add('hidden');
                        broadcastSOS();
                    } else {
                        document.getElementById('sos-countdown-text').innerText = countdownVal;
                    }
                }, 1000);
            }

            // Cancel trigger before countdown ends
            function cancelSOS() {
                if (sosTimer) {
                    clearInterval(sosTimer);
                    sosTimer = null;
                }
                document.getElementById('sos-modal').classList.add('hidden');
            }

            function broadcastSOS() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        submitSOS(position.coords.latitude, position.coords.longitude);
                    }, (error) => {
                        submitSOS(null, null);
                    });
                } else {
                    submitSOS(null, null);
                }
            }

            function submitSOS(lat, lng) {
                fetch("{{ route('sos.store') }}", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": "{{ csrf_token() }}"
                    },
                    body: JSON.stringify({ latitude: lat, longitude: lng })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        ownActiveAlertId = data.alert.id;
                        pollMySOSStatus();
                    }
                })
                .catch(err => console.error("SOS failed", err));
            }

            // Poller checking active SOS signals from other neighbors
            setInterval(() => {
                fetch("{{ route('sos.active') }}")
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.alerts.length > 0) {
                            let alert = data.alerts[0];
                            activeBannerAlertId = alert.id;
                            document.getElementById('emergency-sender-name').innerText = alert.user.name;
                            
                            if (alert.latitude && alert.longitude) {
                                document.getElementById('emergency-location-map-btn').href = `https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`;
                                document.getElementById('emergency-location-map-btn').classList.remove('hidden');
                            } else {
                                document.getElementById('emergency-location-map-btn').classList.add('hidden');
                            }
                            
                            if ("{{ auth()->user()->role }}" === 'admin') {
                                document.getElementById('emergency-resolve-btn').classList.remove('hidden');
                            } else {
                                document.getElementById('emergency-resolve-btn').classList.add('hidden');
                            }

                            document.getElementById('emergency-alert-banner').classList.remove('translate-y-full');
                            document.getElementById('emergency-alert-banner').classList.add('translate-y-0');
                            playSiren();
                        } else {
                            document.getElementById('emergency-alert-banner').classList.remove('translate-y-0');
                            document.getElementById('emergency-alert-banner').classList.add('translate-y-full');
                            stopSiren();
                        }
                    })
                    .catch(err => console.error("SOS active check failed", err));
            }, 15000);

            // Acknowledge and dispatch help to neighbor's SOS
            function acknowledgeActiveEmergency() {
                if (!activeBannerAlertId) return;
                fetch(`/sos/${activeBannerAlertId}/acknowledge`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": "{{ csrf_token() }}"
                    }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('emergency-acknowledge-btn').innerText = "🤝 Dispatched!";
                        document.getElementById('emergency-acknowledge-btn').disabled = true;
                        stopSiren();
                    }
                })
                .catch(err => console.error("SOS acknowledge failed", err));
            }

            function resolveActiveEmergency() {
                if (!activeBannerAlertId) return;
                fetch(`/sos/${activeBannerAlertId}/resolve`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": "{{ csrf_token() }}"
                    }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('emergency-alert-banner').classList.remove('translate-y-0');
                        document.getElementById('emergency-alert-banner').classList.add('translate-y-full');
                        stopSiren();
                    }
                })
                .catch(err => console.error("SOS resolve failed", err));
            }

            function dismissEmergencyBanner() {
                document.getElementById('emergency-alert-banner').classList.remove('translate-y-0');
                document.getElementById('emergency-alert-banner').classList.add('translate-y-full');
                stopSiren();
            }

            // Poller checking sender's own SOS state (Active -> Acknowledged -> Resolved)
            function pollMySOSStatus() {
                fetch("{{ route('sos.my-active') }}")
                    .then(res => res.json())
                    .then(data => {
                        let card = document.getElementById('my-sos-tracker-card');
                        if (data.success && data.alert) {
                            let alertObj = data.alert;
                            ownActiveAlertId = alertObj.id;
                            card.classList.remove('hidden');
                            setTimeout(() => {
                                card.classList.remove('translate-y-full');
                                card.classList.add('translate-y-0');
                            }, 50);

                            if (alertObj.status === 'active') {
                                // Red active state
                                card.className = "fixed bottom-6 left-6 z-[100] max-w-sm w-full bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500";
                                document.getElementById('my-sos-icon-container').className = "h-12 w-12 bg-red-600/20 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse";
                                document.getElementById('my-sos-title').innerText = "SOS Signal Active";
                                document.getElementById('my-sos-description').innerText = "Your emergency signal is active. Waiting for neighborhood dispatch response...";
                                document.getElementById('my-sos-card-bg').className = "absolute -right-10 -top-10 w-40 h-40 bg-red-600/10 rounded-full transition-all duration-700 animate-pulse";
                            } else if (alertObj.status === 'acknowledged') {
                                // Green acknowledged state (Help is Coming!)
                                card.className = "fixed bottom-6 left-6 z-[100] max-w-sm w-full bg-emerald-950 border border-emerald-800 text-white p-6 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500";
                                document.getElementById('my-sos-icon-container').className = "h-12 w-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0 animate-bounce";
                                document.getElementById('my-sos-title').innerHTML = "🚨 HELP IS ARRIVING!";
                                document.getElementById('my-sos-description').innerText = "Assistance has been dispatched to your location. Please stay calm and stay safe.";
                                document.getElementById('my-sos-card-bg').className = "absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full transition-all duration-700 animate-pulse";
                            }
                        } else {
                            // Hide card if resolved or none exists
                            card.classList.remove('translate-y-0');
                            card.classList.add('translate-y-full');
                            setTimeout(() => {
                                card.classList.add('hidden');
                            }, 500);
                        }
                    })
                    .catch(err => console.error("Poll my active SOS failed", err));
            }

            // Periodically poll own active SOS state from page load (if page is reloaded during alert)
            setInterval(pollMySOSStatus, 15000);

            // Resolve own active SOS alert
            function resolveOwnSOS() {
                if (!ownActiveAlertId) return;
                fetch(`/sos/${ownActiveAlertId}/resolve`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": "{{ csrf_token() }}"
                    }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        pollMySOSStatus();
                    }
                })
                .catch(err => console.error("SOS resolve failed", err));
            }

            // Real-Time Notification Listener
            document.addEventListener('DOMContentLoaded', () => {
                if (window.Echo) {
                    window.Echo.channel('incidents')
                        .listen('.IncidentReported', (data) => {
                            console.log('Real-time incident received:', data);
                            showRealtimeAlert(data);
                        });

                    window.Echo.channel('sos-alerts')
                        .listen('.SosAlertBroadcast', (data) => {
                            console.log('Real-time SOS received:', data);
                            handleIncomingSOS(data);
                        });
                }
            });

            function handleIncomingSOS(alert) {
                // Check if this alert is active and not from current user
                if (alert.status === 'active') {
                    activeBannerAlertId = alert.id;
                    document.getElementById('emergency-sender-name').innerText = alert.user_name;
                    
                    if (alert.latitude && alert.longitude) {
                        document.getElementById('emergency-location-map-btn').href = `https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`;
                        document.getElementById('emergency-location-map-btn').classList.remove('hidden');
                    } else {
                        document.getElementById('emergency-location-map-btn').classList.add('hidden');
                    }
                    
                    if ("{{ auth()->user()->role }}" === 'admin') {
                        document.getElementById('emergency-resolve-btn').classList.remove('hidden');
                    } else {
                        document.getElementById('emergency-resolve-btn').classList.add('hidden');
                    }

                    document.getElementById('emergency-alert-banner').classList.remove('translate-y-full');
                    document.getElementById('emergency-alert-banner').classList.add('translate-y-0');
                    playSiren();
                } else if (alert.status === 'resolved') {
                    // Hide if resolved
                    if (activeBannerAlertId == alert.id) {
                        dismissEmergencyBanner();
                    }
                }
            }

            let notificationTimeout = null;

            function showRealtimeAlert(data) {
                const toast = document.getElementById('realtime-notification');
                const title = document.getElementById('notification-title');
                const message = document.getElementById('notification-message');
                const typeTag = document.getElementById('notification-type-tag');
                const priorityTag = document.getElementById('notification-priority-tag');
                const progress = document.getElementById('notification-progress');

                // Update content
                title.innerText = data.title;
                message.innerText = data.message;
                typeTag.innerText = data.type.toUpperCase();
                priorityTag.innerText = data.priority.toUpperCase();
                
                // Color coding based on type
                if (data.type === 'crime') {
                    typeTag.className = "text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-300 px-2 py-0.5 rounded";
                } else if (data.type === 'accident') {
                    typeTag.className = "text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded";
                } else {
                    typeTag.className = "text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded";
                }

                // Color coding based on priority
                if (data.priority === 'critical') {
                    priorityTag.className = "text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-2 py-0.5 rounded shadow-sm";
                } else if (data.priority === 'high') {
                    priorityTag.className = "text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-600 px-2 py-0.5 rounded border border-orange-200";
                } else if (data.priority === 'medium') {
                    priorityTag.className = "text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 px-2 py-0.5 rounded border border-blue-200";
                } else {
                    priorityTag.className = "text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200";
                }

                // Show toast
                toast.classList.remove('hidden');
                setTimeout(() => {
                    toast.classList.remove('translate-x-full');
                    toast.classList.add('translate-x-0');
                }, 100);

                // Animate progress bar
                progress.style.transition = 'none';
                progress.style.width = '100%';
                setTimeout(() => {
                    progress.style.transition = 'width 5s linear';
                    progress.style.width = '0%';
                }, 100);

                // Auto hide
                if (notificationTimeout) clearTimeout(notificationTimeout);
                notificationTimeout = setTimeout(dismissRealtimeNotification, 5000);
            }

            function dismissRealtimeNotification() {
                const toast = document.getElementById('realtime-notification');
                toast.classList.remove('translate-x-0');
                toast.classList.add('translate-x-full');
                setTimeout(() => {
                    toast.classList.add('hidden');
                }, 700);
            }
        </script>

        <!-- Real-Time Incident Notification Toast -->
        <div id="realtime-notification" class="fixed top-6 right-6 z-[110] max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden transform translate-x-full transition-transform duration-700 ease-in-out hidden">
            <div class="p-5 relative">
                <div class="flex items-start gap-4">
                    <div id="notification-icon-bg" class="h-12 w-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <div class="flex-1 pr-6">
                        <div class="flex flex-wrap items-center gap-2">
                            <span id="notification-type-tag" class="text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">NEW INCIDENT</span>
                            <span id="notification-priority-tag" class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">PRIORITY</span>
                            <span class="text-[10px] text-slate-500 font-bold uppercase">JUST NOW</span>
                        </div>
                        <h4 id="notification-title" class="text-sm font-black mt-1 leading-tight">Emergency Reported</h4>
                        <p id="notification-message" class="text-xs text-slate-400 mt-1 leading-relaxed">
                            A new incident has been reported in your vicinity.
                        </p>
                    </div>
                    <button onclick="dismissRealtimeNotification()" class="absolute top-4 right-4 text-slate-500 hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <!-- Progress Bar for Auto-dismiss -->
            <div class="h-1 w-full bg-slate-800">
                <div id="notification-progress" class="h-full bg-indigo-500 w-full"></div>
            </div>
        </div>

        <!-- Hover-Prefetching Speed Optimizer (Butter Mode!) -->
        <script>
            document.addEventListener('DOMContentLoaded', function () {
                const links = document.querySelectorAll('nav a');
                links.forEach(link => {
                    link.addEventListener('mouseenter', function () {
                        const url = this.getAttribute('href');
                        // Prefetch URL if it is a valid internal link and not already prefetched
                        if (url && (url.startsWith('/') || url.startsWith(window.location.origin)) && !url.includes('#') && !url.includes('logout')) {
                            const absoluteUrl = url.startsWith('/') ? window.location.origin + url : url;
                            if (!document.querySelector(`link[href="${absoluteUrl}"]`)) {
                                const prefetchLink = document.createElement('link');
                                prefetchLink.rel = 'prefetch';
                                prefetchLink.href = absoluteUrl;
                                document.head.appendChild(prefetchLink);
                            }
                        }
                    }, { once: true });
                });
            });
        </script>

        @stack('scripts')
    </body>
</html>

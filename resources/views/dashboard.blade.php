@extends('layouts.app')

@section('header_title', 'Dashboard Overview')

@section('content')
<!-- Fonts -->
<link rel="preconnect" href="https://fonts.bunny.net">
<link href="https://fonts.bunny.net/css?family=merriweather:300,400,700&display=swap" rel="stylesheet" />

<style>
    .font-serif-custom { font-family: 'Merriweather', serif; }
</style>

<!-- Custom Welcome & Status Banner -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-2xl shadow-lg border border-slate-800 relative overflow-hidden mb-6">
    <div class="relative z-10">
        <span class="text-xs font-black uppercase tracking-widest text-indigo-400">Neighborhood Safety Center</span>
        <h2 class="text-3xl font-black font-serif-custom mt-1">Hello, {{ auth()->user()->name }} 👋</h2>
        <p class="text-sm text-slate-300 mt-1.5 leading-relaxed">Here is the latest security report and active overview for your community sector.</p>
    </div>
    <div class="flex items-center gap-2.5 bg-slate-800/60 backdrop-blur border border-slate-700/50 px-4 py-2.5 rounded-xl relative z-10 self-start md:self-auto">
        <span class="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
        <span class="text-xs font-black text-slate-200 uppercase tracking-widest">Sector Status: Secure</span>
    </div>
    <div class="absolute -right-12 -top-12 w-44 h-44 bg-indigo-600/10 rounded-full filter blur-xl"></div>
    <div class="absolute -left-12 -bottom-12 w-44 h-44 bg-slate-700/10 rounded-full filter blur-xl"></div>
</div>

<div class="space-y-8">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl border-t-4 border-t-indigo-600 border-x border-b border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Incidents</p>
                    <h3 class="text-4xl font-black text-slate-900 mt-2 font-serif-custom">{{ $totalReports }}</h3>
                </div>
                <div class="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100/40">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
            </div>
            <div class="mt-5 pt-4 border-t border-slate-100">
                <a href="{{ route('reports.index') }}" class="text-xs font-black text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1">
                    View neighborhood map
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border-t-4 border-t-emerald-600 border-x border-b border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">My Contributions</p>
                    <h3 class="text-4xl font-black text-slate-900 mt-2 font-serif-custom">{{ $myReports }}</h3>
                </div>
                <div class="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/40">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
            <div class="mt-5 pt-4 border-t border-slate-100">
                <a href="{{ route('reports.my-reports') }}" class="text-xs font-black text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1">
                    View my contribution list
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border-t-4 border-t-amber-600 border-x border-b border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Verification Status</p>
                    <h3 class="text-3xl font-black text-slate-900 mt-2 font-serif-custom capitalize">{{ auth()->user()->status }}</h3>
                </div>
                <div class="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100/40">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
            </div>
            <div class="mt-5 pt-4 border-t border-slate-100">
                <span class="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M6.267 3.585a.75.75 0 00-.012 1.06L11.53 10l-5.275 5.354a.75.75 0 101.074 1.05l5.8-5.875a.75.75 0 000-1.06l-5.8-5.875a.75.75 0 00-1.062-.012z" clip-rule="evenodd" />
                    </svg>
                    Verified community resident
                </span>
            </div>
        </div>
    </div>

    <!-- Analytics Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Incident Types Chart -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition duration-300">
            <h3 class="text-lg font-black text-slate-950 font-serif-custom mb-6 flex items-center gap-2">
                <span class="h-3.5 w-1.5 bg-indigo-600 rounded-full"></span>
                Incident Breakdown
            </h3>
            <div class="relative h-64 w-full flex justify-center">
                <canvas id="typeChart"></canvas>
            </div>
        </div>

        <!-- Resolution Status Chart -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition duration-300">
            <h3 class="text-lg font-black text-slate-950 font-serif-custom mb-6 flex items-center gap-2">
                <span class="h-3.5 w-1.5 bg-amber-500 rounded-full"></span>
                Resolution Status
            </h3>
            <div class="relative h-64 w-full flex justify-center">
                <canvas id="statusChart"></canvas>
            </div>
        </div>
    </div>

    <!-- Recent Reports Preview -->
    <div class="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition duration-300">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-lg font-black text-slate-950 font-serif-custom flex items-center gap-2">
                <span class="h-3.5 w-1.5 bg-slate-900 rounded-full"></span>
                Recent Incidents
            </h3>
            <a href="{{ route('reports.index') }}" class="text-xs font-black text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-0.5">
                See all reports
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                </svg>
            </a>
        </div>
        <div class="divide-y divide-slate-100">
            @forelse($latestReports as $report)
                <div class="p-6 flex items-start gap-4 hover:bg-slate-50/40 transition duration-200 border-l-4 
                    {{ $report->type == 'crime' ? 'border-l-red-600' : '' }}
                    {{ $report->type == 'accident' ? 'border-l-amber-500' : '' }}
                    {{ $report->type == 'suspicious' ? 'border-l-indigo-600' : '' }}
                    {{ $report->type == 'other' ? 'border-l-slate-400' : '' }}">
                    <div class="h-10 w-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-200/50">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between">
                            <h4 class="font-bold text-slate-900 text-base font-serif-custom hover:text-indigo-600 transition">
                                <a href="{{ route('reports.show', $report) }}">{{ $report->title }}</a>
                            </h4>
                            <span class="text-xs font-bold px-3 py-1 rounded-full border
                                {{ $report->type == 'crime' ? 'bg-red-50 text-red-700 border-red-100' : '' }}
                                {{ $report->type == 'accident' ? 'bg-amber-50 text-amber-700 border-amber-100' : '' }}
                                {{ $report->type == 'suspicious' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : '' }}
                                {{ $report->type == 'other' ? 'bg-slate-50 text-slate-700 border-slate-100' : '' }}">
                                {{ ucfirst($report->type) }}
                            </span>
                        </div>
                        <p class="text-sm text-slate-600 mt-2 line-clamp-1 leading-relaxed">{{ $report->description }}</p>
                        <div class="mt-4 flex items-center gap-4 text-xs text-slate-400 font-semibold">
                            <span class="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {{ $report->location }}
                            </span>
                            <span class="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {{ $report->datetime }}
                            </span>
                        </div>
                    </div>
                </div>
            @empty
                <div class="p-12 text-center text-slate-500 font-medium">
                    No reports available yet.
                </div>
            @endforelse
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const typeData = @json($typeData);
        const statusData = @json($statusData);

        // Sophisticated Color Palette (Trustworthy & Mature)
        const typeColors = {
            'crime': '#b91c1c',        // Deep Crimson
            'accident': '#d97706',     // Mature Amber
            'suspicious': '#4f46e5',   // Indigo
            'other': '#64748b'         // Slate
        };

        const statusColors = {
            'pending': '#d97706',      // Mature Amber
            'investigating': '#4f46e5',// Indigo
            'resolved': '#059669'      // Sage Emerald Green
        };

        // Render Type Chart (Doughnut)
        const typeCtx = document.getElementById('typeChart').getContext('2d');
        new Chart(typeCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeData).map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                datasets: [{
                    data: Object.values(typeData),
                    backgroundColor: Object.keys(typeData).map(k => typeColors[k] || '#64748b'),
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: '600'
                            },
                            color: '#334155'
                        }
                    }
                }
            }
        });

        // Render Status Chart (Bar)
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        new Chart(statusCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(statusData).map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                datasets: [{
                    label: 'Number of Reports',
                    data: Object.values(statusData),
                    backgroundColor: Object.keys(statusData).map(k => statusColors[k] || '#64748b'),
                    borderRadius: 8,
                    maxBarThickness: 45
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { 
                        beginAtZero: true, 
                        ticks: { stepSize: 1, color: '#64748b' },
                        grid: { color: '#f1f5f9' }
                    },
                    x: {
                        ticks: { color: '#64748b', font: { weight: '600' } },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    });
</script>
@endpush

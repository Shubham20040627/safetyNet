@extends('layouts.app')

@section('header_title', 'Community Notices')

@section('content')
<div class="max-w-4xl mx-auto space-y-6">
    <div class="flex flex-col gap-2 mb-2">
        <h2 class="text-2xl font-black text-slate-900 font-serif-custom">Announcement Archive</h2>
        <p class="text-slate-500 text-sm font-medium">Stay informed with the latest news, safety drills, and updates from neighborhood watch management.</p>
    </div>

    <div class="space-y-4">
        @forelse($announcements as $announcement)
            <div class="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition p-6 relative">
                <!-- Indicator bar on left -->
                <div class="absolute left-0 top-0 bottom-0 w-1.5 
                    {{ $announcement->type == 'critical' ? 'bg-red-600' : '' }}
                    {{ $announcement->type == 'warning' ? 'bg-amber-500' : '' }}
                    {{ $announcement->type == 'info' ? 'bg-indigo-600' : '' }}"></div>

                <div class="flex items-center justify-between gap-4 mb-3">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded 
                            {{ $announcement->type == 'critical' ? 'bg-red-100 text-red-700' : '' }}
                            {{ $announcement->type == 'warning' ? 'bg-amber-100 text-amber-700' : '' }}
                            {{ $announcement->type == 'info' ? 'bg-indigo-100 text-indigo-700' : '' }}">
                            {{ $announcement->type }}
                        </span>
                        <span class="text-xs font-medium text-slate-400">{{ $announcement->created_at->format('M d, Y • h:i A') }}</span>
                    </div>
                </div>

                <h3 class="text-xl font-black text-slate-900 font-serif-custom mb-2">{{ $announcement->title }}</h3>
                <p class="text-slate-600 leading-relaxed">{{ $announcement->content }}</p>
                
                <div class="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Posted by Neighborhood Admin
                </div>
            </div>
        @empty
            <div class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <div class="bg-slate-200 h-16 w-16 rounded-full mx-auto flex items-center justify-center text-slate-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                </div>
                <h3 class="text-lg font-bold text-slate-700">No Active Announcements</h3>
                <p class="text-slate-500 text-sm mt-1">Everything is quiet right now. New broadcasted messages will appear here.</p>
            </div>
        @endforelse
    </div>

    <div class="mt-6">
        {{ $announcements->links() }}
    </div>
</div>
@endsection

<style>
    .font-serif-custom { font-family: 'Merriweather', serif; }
</style>

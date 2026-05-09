@extends('layouts.app')

@section('header_title', 'My Reported Incidents')

@section('content')
<div class="space-y-6">
    <div class="bg-indigo-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div class="relative z-10">
            <h2 class="text-3xl font-bold">Your Contributions</h2>
            <p class="text-indigo-100 mt-2">Thank you for helping keep our neighborhood safe. You have reported {{ $reports->total() }} incidents.</p>
        </div>
        <div class="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-64 w-64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        </div>
    </div>

    @if($reports->isEmpty())
        <div class="bg-white p-20 rounded-xl shadow-md text-center">
            <div class="mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">You haven't reported any incidents yet</h3>
            <p class="text-gray-500 mt-2">If you see something, say something. Your reports help the whole community.</p>
            <a href="{{ route('reports.create') }}" class="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                Start First Report
            </a>
        </div>
    @else
        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <table class="w-full text-left">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Incident</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @foreach($reports as $report)
                        <tr class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4">
                                <div class="font-bold text-gray-800 hover:text-indigo-600 transition">
                                    <a href="{{ route('reports.show', $report) }}">{{ $report->title }}</a>
                                </div>
                                <div class="text-xs text-gray-400 mt-1 line-clamp-1">{{ $report->description }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
                                    {{ $report->type == 'crime' ? 'bg-red-100 text-red-600' : '' }}
                                    {{ $report->type == 'accident' ? 'bg-yellow-100 text-yellow-600' : '' }}
                                    {{ $report->type == 'suspicious' ? 'bg-purple-100 text-purple-600' : '' }}
                                    {{ $report->type == 'other' ? 'bg-gray-100 text-gray-600' : '' }}">
                                    {{ $report->type }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">{{ $report->location }}</td>
                            <td class="px-6 py-4 text-sm text-gray-500">{{ \Carbon\Carbon::parse($report->datetime)->format('M d, Y') }}</td>
                            <td class="px-6 py-4">
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase 
                                    {{ $report->status == 'resolved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600' }}">
                                    {{ $report->status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <a href="{{ route('reports.show', $report) }}" class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                                    View
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                    </svg>
                                </a>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="mt-6">
            {{ $reports->links() }}
        </div>
    @endif
</div>
@endsection

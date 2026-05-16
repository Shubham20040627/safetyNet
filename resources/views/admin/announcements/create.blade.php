@extends('layouts.app')

@section('header_title', 'Create Announcement')

@section('content')
<div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-800">New Announcement</h2>
            <p class="text-sm text-gray-500">Fill out the details to post a notice to the dashboard.</p>
        </div>

        <form action="{{ route('admin.announcements.store') }}" method="POST" class="space-y-5">
            @csrf

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1" for="title">Announcement Title</label>
                <input type="text" name="title" id="title" value="{{ old('title') }}" required
                    class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="e.g., Upcoming Community Meeting, Severe Storm Alert">
                @error('title') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1" for="type">Priority / Type</label>
                <select name="type" id="type" required
                    class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                    <option value="info" {{ old('type') == 'info' ? 'selected' : '' }}>🔵 Info (Blue Banner)</option>
                    <option value="warning" {{ old('type') == 'warning' ? 'selected' : '' }}>🟡 Warning (Yellow Banner)</option>
                    <option value="critical" {{ old('type') == 'critical' ? 'selected' : '' }}>🔴 Critical (Red Banner)</option>
                </select>
                @error('type') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1" for="content">Details / Description</label>
                <textarea name="content" id="content" rows="5" required
                    class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Provide specifics here...">{{ old('content') }}</textarea>
                @error('content') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-50">
                <a href="{{ route('admin.announcements.index') }}" class="text-gray-500 text-sm hover:underline">Cancel</a>
                <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition shadow-md">
                    Publish Announcement
                </button>
            </div>
        </form>
    </div>
</div>
@endsection

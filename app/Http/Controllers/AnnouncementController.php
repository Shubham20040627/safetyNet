<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Display all active announcements for regular users.
     */
    public function publicIndex()
    {
        $neighborhoodName = auth()->user()->neighborhood_name;

        $announcements = Announcement::active()
            ->whereHas('user', function($query) use ($neighborhoodName) {
                $query->where('neighborhood_name', $neighborhoodName);
            })
            ->latest()
            ->paginate(15);

        return \Inertia\Inertia::render('Announcements/Index', compact('announcements'));
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $neighborhoodName = auth()->user()->neighborhood_name;

        $announcements = Announcement::whereHas('user', function($query) use ($neighborhoodName) {
                $query->where('neighborhood_name', $neighborhoodName);
            })
            ->latest()
            ->paginate(10);

        return \Inertia\Inertia::render('Admin/Announcements/Index', compact('announcements'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return \Inertia\Inertia::render('Admin/Announcements/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:info,warning,critical',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['is_active'] = true;

        Announcement::create($validated);

        // Clear dashboard cache so new announcements appear instantly
        cache()->forget("dashboard_stats_" . auth()->user()->neighborhood_name);

        return redirect()->route('admin.announcements.index')->with('success', 'Announcement created successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        // Clear dashboard cache so deleted announcements disappear instantly
        cache()->forget("dashboard_stats_" . auth()->user()->neighborhood_name);

        return redirect()->route('admin.announcements.index')->with('success', 'Announcement deleted successfully.');
    }
}

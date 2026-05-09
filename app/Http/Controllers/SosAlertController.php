<?php

namespace App\Http\Controllers;

use App\Models\SosAlert;
use Illuminate\Http\Request;

class SosAlertController extends Controller
{
    /**
     * Store a newly created active SOS alert in database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        // Resolve any existing active or acknowledged SOS alerts of the current user
        SosAlert::where('user_id', auth()->id())
            ->whereIn('status', ['active', 'acknowledged'])
            ->update(['status' => 'resolved']);

        // Create the new active SOS alert
        $alert = SosAlert::create([
            'user_id' => auth()->id(),
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Emergency SOS alert broadcasted successfully.',
            'alert' => $alert
        ]);
    }

    /**
     * Get active SOS alerts from other users.
     */
    public function active()
    {
        $alerts = SosAlert::where('status', 'active')
            ->where('user_id', '!=', auth()->id())
            ->with('user')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'alerts' => $alerts
        ]);
    }

    /**
     * Mark an active SOS alert as acknowledged (help is dispatched).
     */
    public function acknowledge(SosAlert $sosAlert)
    {
        $sosAlert->update(['status' => 'acknowledged']);

        return response()->json([
            'success' => true,
            'message' => 'SOS alert acknowledged. Help has been dispatched.'
        ]);
    }

    /**
     * Get the logged-in user's own active or acknowledged SOS alert.
     */
    public function myActive()
    {
        $alert = SosAlert::where('user_id', auth()->id())
            ->whereIn('status', ['active', 'acknowledged'])
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'alert' => $alert
        ]);
    }

    /**
     * Mark an active SOS alert as resolved.
     */
    public function resolve(SosAlert $sosAlert)
    {
        // Only the alert owner or an admin can resolve the alert
        if ($sosAlert->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.'
            ], 403);
        }

        $sosAlert->update(['status' => 'resolved']);

        return response()->json([
            'success' => true,
            'message' => 'SOS alert resolved successfully.'
        ]);
    }
}

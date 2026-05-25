<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class SuperAdminController extends Controller
{
    /**
     * Display the Super Admin Dashboard with Admin list and stats.
     */
    public function index()
    {
        // Calculate administrative stats
        $totalAdmins = User::where('role', 'admin')->count();
        $approvedAdmins = User::where('role', 'admin')->where('status', 'approved')->count();
        $pendingRequests = User::where('role', 'admin')->where('status', 'pending')->count();
        $rejectedRequests = User::where('role', 'admin')->where('status', 'rejected')->count();

        // Get all neighborhood admins in chronological order
        $admins = User::where('role', 'admin')->latest()->get();

        return \Inertia\Inertia::render('SuperAdmin/Dashboard', compact(
            'totalAdmins',
            'approvedAdmins',
            'pendingRequests',
            'rejectedRequests',
            'admins'
        ));
    }

    /**
     * Approve a pending/rejected neighborhood admin.
     */
    public function approveAdmin(User $user)
    {
        if ($user->role !== 'admin') {
            return back()->with('error', 'Unauthorized operation.');
        }

        $user->update(['status' => 'approved']);

        return back()->with('success', "Administrative privileges granted to {$user->name} successfully!");
    }

    /**
     * Reject a pending/approved neighborhood admin.
     */
    public function rejectAdmin(User $user)
    {
        if ($user->role !== 'admin') {
            return back()->with('error', 'Unauthorized operation.');
        }

        $user->update(['status' => 'rejected']);

        return back()->with('success', "Administrative access has been suspended/rejected for {$user->name}.");
    }

    /**
     * Permanently delete an admin account.
     */
    public function deleteAdmin(User $user)
    {
        if ($user->role !== 'admin') {
            return back()->with('error', 'Unauthorized operation.');
        }

        $adminName = $user->name;
        $neighborhoodName = $user->neighborhood_name;

        $user->delete();

        if (!empty($neighborhoodName)) {
            cache()->forget("dashboard_stats_{$neighborhoodName}");
            cache()->forget("analytics_stats_{$neighborhoodName}");
            cache()->forget("heatmap_reports_{$neighborhoodName}");
            cache()->forget("neighborhood_meta_{$neighborhoodName}");
            cache()->forget("global_chat_context");
        }

        return back()->with('success', "Neighborhood Admin account '{$adminName}' has been permanently deleted from the safety network.");
    }

    /**
     * Force resolve all active or acknowledged SOS alerts in the system.
     */
    public function resetSosAlerts()
    {
        \App\Models\SosAlert::whereIn('status', ['active', 'acknowledged'])
            ->update(['status' => 'resolved']);

        return back()->with('success', 'All active neighborhood Emergency SOS signals have been successfully resolved and cleared.');
    }
}

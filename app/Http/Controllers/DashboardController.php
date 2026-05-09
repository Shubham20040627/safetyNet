<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalReports = Report::count();
        $myReports = auth()->user()->reports()->count();
        
        // Latest reports for the dashboard preview
        $latestReports = Report::with('user')->latest()->take(5)->get();

        // Analytics Data
        $typeData = Report::selectRaw('type, COUNT(*) as count')->groupBy('type')->pluck('count', 'type')->toArray();
        $statusData = Report::selectRaw('status, COUNT(*) as count')->groupBy('status')->pluck('count', 'status')->toArray();

        return view('dashboard', compact('totalReports', 'myReports', 'latestReports', 'typeData', 'statusData'));
    }
}

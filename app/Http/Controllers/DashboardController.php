<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        if (auth()->user()->role === 'super_admin') {
            return redirect()->route('superadmin.dashboard');
        }

        $neighborhoodName = auth()->user()->neighborhood_name;

        // Cache heavy dashboard analytics and counts for 5 minutes
        $cacheKey = "dashboard_stats_{$neighborhoodName}";
        
        $stats = cache()->remember($cacheKey, 300, function() use ($neighborhoodName) {
            $neighborhoodReports = Report::whereHas('user', function($q) use ($neighborhoodName) {
                $q->where('neighborhood_name', $neighborhoodName);
            });

            $totalReports = (clone $neighborhoodReports)->count();
            
            // Latest reports for the dashboard preview in this neighborhood
            $latestReports = (clone $neighborhoodReports)->with('user')->latest()->take(5)->get();

            // Fetch Active Announcements in this neighborhood
            $announcements = \App\Models\Announcement::active()
                ->whereHas('user', function($q) use ($neighborhoodName) {
                    $q->where('neighborhood_name', $neighborhoodName);
                })->latest()->take(3)->get();

            // Analytics Data for this neighborhood
            $typeData = (clone $neighborhoodReports)->selectRaw('type, COUNT(*) as count')->groupBy('type')->pluck('count', 'type')->toArray();
            $statusData = (clone $neighborhoodReports)->selectRaw('status, COUNT(*) as count')->groupBy('status')->pluck('count', 'status')->toArray();

            // --- Advanced Predictive Analytics ---
            // 1. Hourly Distribution (Find Peak Hours) for this neighborhood
            $driverName = \Illuminate\Support\Facades\DB::connection()->getDriverName();
            $hourField = $driverName === 'pgsql' ? 'EXTRACT(HOUR FROM datetime)' : 'HOUR(datetime)';
            
            $hourlyData = (clone $neighborhoodReports)->selectRaw("{$hourField} as hour, COUNT(*) as count")
                ->groupBy('hour')
                ->orderBy('hour')
                ->pluck('count', 'hour')
                ->toArray();
            
            // Fill missing hours with 0
            $fullHourlyData = array_fill(0, 24, 0);
            foreach($hourlyData as $hour => $count) {
                $fullHourlyData[$hour] = $count;
            }

            // 2. Weekly Trend (Last 7 Days) for this neighborhood
            $weeklyTrend = (clone $neighborhoodReports)->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('count', 'date')
                ->toArray();

            // 3. Smart Insights Calculation
            if ($totalReports === 0) {
                $peakTime = 'N/A';
                $trendDirection = 'stable';
                $trendPercent = 0;
            } else {
                $peakHour = count($fullHourlyData) > 0 ? array_search(max($fullHourlyData), $fullHourlyData) : 0;
                $peakTime = date('h A', strtotime("$peakHour:00"));
                
                $totalLastWeek = array_sum($weeklyTrend);
                $totalPreviousWeek = (clone $neighborhoodReports)->whereBetween('created_at', [now()->subDays(14), now()->subDays(7)])->count();
                $trendDirection = $totalLastWeek >= $totalPreviousWeek ? 'up' : 'down';
                $trendPercent = $totalPreviousWeek > 0 ? round(abs($totalLastWeek - $totalPreviousWeek) / $totalPreviousWeek * 100) : 100;
            }

            return compact(
                'totalReports', 'latestReports', 'typeData', 'statusData', 
                'announcements', 'fullHourlyData', 'weeklyTrend', 'peakTime', 
                'trendDirection', 'trendPercent'
            );
        });

        // Extract cached values
        $totalReports = $stats['totalReports'];
        $latestReports = $stats['latestReports'];
        $typeData = $stats['typeData'];
        $statusData = $stats['statusData'];
        $announcements = $stats['announcements'];
        $fullHourlyData = $stats['fullHourlyData'];
        $weeklyTrend = $stats['weeklyTrend'];
        $peakTime = $stats['peakTime'];
        $trendDirection = $stats['trendDirection'];
        $trendPercent = $stats['trendPercent'];

        // Live count for the current user's reports (cheap query)
        $myReports = auth()->user()->reports()->count();

        return \Inertia\Inertia::render('Dashboard', compact(
            'totalReports', 'myReports', 'latestReports', 'typeData', 'statusData', 
            'announcements', 'fullHourlyData', 'weeklyTrend', 'peakTime', 
            'trendDirection', 'trendPercent'
        ));
    }

    /**
     * Live stats polling endpoint — retrieves stats from cache.
     * Called by the Dashboard frontend every 30 seconds.
     */
    public function liveStats()
    {
        $neighborhoodName = auth()->user()->neighborhood_name;
        $cacheKey = "dashboard_stats_{$neighborhoodName}";

        // Retrieve dashboard stats from cache, or calculate if expired
        $stats = cache()->remember($cacheKey, 300, function() use ($neighborhoodName) {
            $neighborhoodReports = Report::whereHas('user', function($q) use ($neighborhoodName) {
                $q->where('neighborhood_name', $neighborhoodName);
            });

            $totalReports = (clone $neighborhoodReports)->count();
            
            // Latest reports for the dashboard preview in this neighborhood
            $latestReports = (clone $neighborhoodReports)->with('user')->latest()->take(5)->get();

            // Fetch Active Announcements in this neighborhood
            $announcements = \App\Models\Announcement::active()
                ->whereHas('user', function($q) use ($neighborhoodName) {
                    $q->where('neighborhood_name', $neighborhoodName);
                })->latest()->take(3)->get();

            // Analytics Data for this neighborhood
            $typeData = (clone $neighborhoodReports)->selectRaw('type, COUNT(*) as count')->groupBy('type')->pluck('count', 'type')->toArray();
            $statusData = (clone $neighborhoodReports)->selectRaw('status, COUNT(*) as count')->groupBy('status')->pluck('count', 'status')->toArray();

            // --- Advanced Predictive Analytics ---
            // 1. Hourly Distribution (Find Peak Hours) for this neighborhood
            $driverName = \Illuminate\Support\Facades\DB::connection()->getDriverName();
            $hourField = $driverName === 'pgsql' ? 'EXTRACT(HOUR FROM datetime)' : 'HOUR(datetime)';
            
            $hourlyData = (clone $neighborhoodReports)->selectRaw("{$hourField} as hour, COUNT(*) as count")
                ->groupBy('hour')
                ->orderBy('hour')
                ->pluck('count', 'hour')
                ->toArray();
            
            // Fill missing hours with 0
            $fullHourlyData = array_fill(0, 24, 0);
            foreach($hourlyData as $hour => $count) {
                $fullHourlyData[$hour] = $count;
            }

            // 2. Weekly Trend (Last 7 Days) for this neighborhood
            $weeklyTrend = (clone $neighborhoodReports)->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('count', 'date')
                ->toArray();

            // 3. Smart Insights Calculation
            if ($totalReports === 0) {
                $peakTime = 'N/A';
                $trendDirection = 'stable';
                $trendPercent = 0;
            } else {
                $peakHour = count($fullHourlyData) > 0 ? array_search(max($fullHourlyData), $fullHourlyData) : 0;
                $peakTime = date('h A', strtotime("$peakHour:00"));
                
                $totalLastWeek = array_sum($weeklyTrend);
                $totalPreviousWeek = (clone $neighborhoodReports)->whereBetween('created_at', [now()->subDays(14), now()->subDays(7)])->count();
                $trendDirection = $totalLastWeek >= $totalPreviousWeek ? 'up' : 'down';
                $trendPercent = $totalPreviousWeek > 0 ? round(abs($totalLastWeek - $totalPreviousWeek) / $totalPreviousWeek * 100) : 100;
            }

            return compact(
                'totalReports', 'latestReports', 'typeData', 'statusData', 
                'announcements', 'fullHourlyData', 'weeklyTrend', 'peakTime', 
                'trendDirection', 'trendPercent'
            );
        });

        // Map latestReports for JSON output format matching frontend expectations
        $latest = collect($stats['latestReports'])->map(fn($r) => [
            'id'       => $r->id,
            'title'    => $r->title,
            'type'     => $r->type,
            'priority' => $r->priority,
            'status'   => $r->status,
            'location' => $r->location,
            'datetime' => $r->datetime,
            'created_at' => $r->created_at,
            'user'     => ['name' => $r->user?->name],
            'is_simulated' => $r->is_simulated,
        ])->all();

        return response()->json([
            'totalReports' => $stats['totalReports'],
            'latestReports'=> $latest,
            'weeklyTrend'  => $stats['weeklyTrend'],
            'fullHourlyData'=> $stats['fullHourlyData'],
            'peakTime'     => $stats['peakTime'],
            'trendDirection'=> $stats['trendDirection'],
            'trendPercent' => $stats['trendPercent'],
            'myReports'    => auth()->user()->reports()->count(), // live count is cheap
            'timestamp'    => now()->toISOString(),
        ]);
    }
}

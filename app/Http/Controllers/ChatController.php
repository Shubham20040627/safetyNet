<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GeminiService;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    protected $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500',
        ]);

        $userMessage = $request->input('message');
        \Log::info('AI Chat Request: ' . $userMessage);

        $role = auth()->user()->role;
        $neighborhoodName = auth()->user()->neighborhood_name;

        if ($role === 'super_admin') {
            // Global Context for Super Admin - Retrieve from cache
            $globalContext = cache()->remember("global_chat_context", 300, function() {
                $totalIncidents = \App\Models\Report::count();
                $recentIncidents = \App\Models\Report::with('user')->latest()->take(3)->get()->map(function($r) {
                    $nName = $r->user ? $r->user->neighborhood_name : 'Unknown';
                    return "Neighborhood: {$nName}, Type: {$r->type}, Title: {$r->title}, Location: {$r->location}";
                })->implode('; ');

                return compact('totalIncidents', 'recentIncidents');
            });

            $totalIncidents = $globalContext['totalIncidents'];
            $recentIncidents = $globalContext['recentIncidents'];

            $systemPrompt = "You are the 'SafetyNet AI Guardian', a specialized educational safety assistant for the system's Master Super Admin. 
            Provide system-wide insights and answers about the application's global reports and status.
            
            GLOBAL SYSTEM CONTEXT:
            - Total Incidents: {$totalIncidents}
            - Recent Activities: {$recentIncidents}

            OPERATING PROTOCOLS:
            1. Help the Super Admin monitor system-wide reports and activities.
            2. Tone: Professional, structured, and informative.
            3. Disclaimer: Remind them that you are an AI assistant.";
        } else {
            // Local Context for Sector Admins/Residents/Responders - Retrieve from cache
            $dashboardStats = cache()->remember("dashboard_stats_{$neighborhoodName}", 300, function() use ($neighborhoodName) {
                $neighborhoodReports = \App\Models\Report::whereHas('user', function($q) use ($neighborhoodName) {
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

                // Weekly Trend (Last 7 Days)
                $weeklyTrend = (clone $neighborhoodReports)->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->where('created_at', '>=', now()->subDays(7))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->pluck('count', 'date')
                    ->toArray();

                // Smart Insights Calculation
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

            $totalIncidents = $dashboardStats['totalReports'] ?? 0;
            $recentIncidents = collect($dashboardStats['latestReports'] ?? [])->take(3)->map(function($r) {
                return "Type: {$r->type}, Title: {$r->title}, Location: {$r->location}";
            })->implode('; ');

            $systemPrompt = "You are the 'SafetyNet AI Guardian', a specialized educational safety assistant for neighborhood residents. 
            Your goal is to provide helpful, general first-aid steps and neighborhood safety advice based on current data.
            
            CURRENT NEIGHBORHOOD CONTEXT:
            - System-wide Incidents: {$totalIncidents}
            - Recent Activities: {$recentIncidents}

            OPERATING PROTOCOLS:
            1. For medical situations: Provide standard FIRST-AID GUIDANCE (e.g., Heimlich, CPR, basic wound care). Do NOT say 'I cannot help with medical'. Instead, say 'While you wait for professionals, here is standard first-aid...'.
            2. For safety: Use the context above to warn the user or provide peace of mind.
            3. Tone: Calm, fast-acting, and helpful.
            4. Disclaimer: Remind them once per chat that you are an AI and they should call emergency services (Police/Ambulance) for serious threats.";
        }

        try {
            $response = $this->gemini->generateResponse($userMessage, $systemPrompt);
            return response()->json(['response' => $response]);
        } catch (\Exception $e) {
            Log::error('AI Chat Error: ' . $e->getMessage());
            return response()->json(['response' => "I'm sorry, I'm having trouble connecting to my safety protocols right now."], 500);
        }
    }
}

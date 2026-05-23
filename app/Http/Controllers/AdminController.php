<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Report;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users()
    {
        $neighborhoodName = auth()->user()->neighborhood_name;
        $users = User::where('id', '!=', auth()->id())
            ->where('neighborhood_name', $neighborhoodName)
            ->latest()
            ->paginate(10);
        return \Inertia\Inertia::render('Admin/Users', compact('users'));
    }

    public function approveUser(User $user)
    {
        $user->update(['status' => 'approved']);
        return back()->with('success', 'User approved successfully.');
    }

    public function rejectUser(User $user)
    {
        $user->update(['status' => 'rejected']);
        return back()->with('success', 'User rejected successfully.');
    }

    public function reports()
    {
        $neighborhoodName = auth()->user()->neighborhood_name;

        $reports = Report::whereHas('user', function($query) use ($neighborhoodName) {
            $query->where('neighborhood_name', $neighborhoodName);
        })->with('user', 'responder')->latest()->paginate(10);

        $responders = User::where('role', 'responder')
            ->where('neighborhood_name', $neighborhoodName)
            ->get();

        return \Inertia\Inertia::render('Admin/Reports', compact('reports', 'responders'));
    }

    public function resolveReport(Report $report)
    {
        $report->update(['status' => 'resolved']);
        return back()->with('success', 'Report marked as resolved.');
    }

    public function deleteReport(Report $report)
    {
        $report->delete();
        return back()->with('success', 'Report deleted successfully.');
    }

    public function makeResponder(User $user)
    {
        $user->update(['role' => 'responder']);
        return back()->with('success', 'User promoted to Responder.');
    }

    public function removeResponder(User $user)
    {
        $user->update(['role' => 'user']);
        return back()->with('success', 'User demoted to regular User.');
    }

    public function assignResponder(Request $request, Report $report)
    {
        $request->validate([
            'responder_id' => 'required|exists:users,id',
        ]);

        $report->update([
            'responder_id' => $request->responder_id,
            'status' => 'investigating'
        ]);

        return back()->with('success', 'Responder assigned and report is now being investigated.');
    }

    public function analytics()
    {
        $neighborhoodName = auth()->user()->neighborhood_name;

        $baseQuery = Report::whereHas('user', function($query) use ($neighborhoodName) {
            $query->where('neighborhood_name', $neighborhoodName);
        });

        // 1. Core Metrics
        $totalIncidents = (clone $baseQuery)->count();
        $unresolvedIncidents = (clone $baseQuery)->where('status', '!=', 'resolved')->count();
        $resolvedIncidents = (clone $baseQuery)->where('status', 'resolved')->count();
        
        // Calculate average resolution time (in hours)
        $resolvedReports = (clone $baseQuery)->where('status', 'resolved')
            ->whereNotNull('created_at')
            ->whereNotNull('updated_at')
            ->get();
            
        $totalHours = 0;
        $count = $resolvedReports->count();
        foreach ($resolvedReports as $report) {
            $created = \Carbon\Carbon::parse($report->created_at);
            $updated = \Carbon\Carbon::parse($report->updated_at);
            $totalHours += $created->diffInHours($updated);
        }
        $avgResolutionTime = $count > 0 ? round($totalHours / $count, 1) : 0;

        // 2. Incident Category Distribution
        $typeData = (clone $baseQuery)->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();

        // Ensure all types exist in types list
        $typesList = ['crime', 'accident', 'suspicious', 'other'];
        foreach ($typesList as $t) {
            if (!isset($typeData[$t])) {
                $typeData[$t] = 0;
            }
        }

        // 3. Priority Distribution
        $priorityData = (clone $baseQuery)->selectRaw('priority, COUNT(*) as count')
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();
        $priorityList = ['low', 'medium', 'high', 'critical'];
        foreach ($priorityList as $p) {
            if (!isset($priorityData[$p])) {
                $priorityData[$p] = 0;
            }
        }

        // 4. Hourly Peak Distribution
        $driverName = \Illuminate\Support\Facades\DB::connection()->getDriverName();
        $hourField = $driverName === 'pgsql' ? 'EXTRACT(HOUR FROM datetime)' : 'HOUR(datetime)';

        $hourlyData = (clone $baseQuery)->selectRaw("{$hourField} as hour, COUNT(*) as count")
            ->groupBy('hour')
            ->orderBy('hour')
            ->pluck('count', 'hour')
            ->toArray();
        $fullHourlyData = array_fill(0, 24, 0);
        foreach ($hourlyData as $hour => $c) {
            $fullHourlyData[$hour] = $c;
        }

        // 5. Weekly Safety Trend & AI Forecast
        $weeklyData = (clone $baseQuery)->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->toArray();

        // Simple linear progression trend forecast for next 3 days
        $forecastData = [];
        $dates = array_keys($weeklyData);
        $counts = array_values($weeklyData);
        $n = count($counts);
        
        if ($n > 1) {
            // Calculate simple slope (m)
            $sumX = 0; $sumY = 0; $sumXY = 0; $sumXX = 0;
            for ($i = 0; $i < $n; $i++) {
                $sumX += $i;
                $sumY += $counts[$i];
                $sumXY += $i * $counts[$i];
                $sumXX += $i * $i;
            }
            $slope = ($n * $sumXY - $sumX * $sumY) / ($n * $sumXX - $sumX * $sumX);
            $intercept = ($sumY - $slope * $sumX) / $n;
            
            // Forecast 3 days ahead
            for ($i = $n; $i < $n + 3; $i++) {
                $forecastVal = max(0, round($slope * $i + $intercept, 1));
                $forecastData[] = $forecastVal;
            }
        } else {
            $forecastData = [0, 0, 0];
        }

        return \Inertia\Inertia::render('Admin/Analytics', compact(
            'totalIncidents', 'unresolvedIncidents', 'resolvedIncidents', 'avgResolutionTime',
            'typeData', 'priorityData', 'fullHourlyData', 'weeklyData', 'forecastData'
        ));
    }

    public function seedDemoData(Request $request)
    {
        if (auth()->user()->role === 'admin') {
            \App\Helpers\SampleDataSeeder::seedIfNeeded(auth()->user(), true);
            cache()->forget("dashboard_stats_" . auth()->user()->neighborhood_name);
        }

        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json(['success' => true, 'message' => 'Demo data seeded successfully.']);
        }

        return back()->with('success', 'Demo data populated successfully.');
    }

    public function clearDemoData(Request $request)
    {
        if (auth()->user()->role === 'admin') {
            $neighborhoodName = auth()->user()->neighborhood_name;
            
            // Optimize query to avoid deadlock-prone subqueries in DELETE statement
            $userIds = \App\Models\User::where('neighborhood_name', $neighborhoodName)->pluck('id');
            \App\Models\Report::whereIn('user_id', $userIds)->delete();
            
            cache()->forget("dashboard_stats_" . $neighborhoodName);
        }

        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json(['success' => true, 'message' => 'Sandbox data cleared.']);
        }

        return back()->with('success', 'Sandbox data cleared successfully.');
    }

    public function pushDemoIncident(Request $request)
    {
        $admin = auth()->user();
        if ($admin->role !== 'admin') {
            return back()->with('error', 'Unauthorized action.');
        }

        $neighborhoodName = $admin->neighborhood_name;

        // Choose a random template
        $templates = [
            [
                'title'       => 'Suspicious Individual Near ATM',
                'description' => 'A hooded individual has been loitering around the ATM machine for over 30 minutes, watching people withdraw cash.',
                'type'        => 'suspicious',
                'priority'    => 'high',
                'location'    => 'Community Bank ATM, Sector Market',
                'ai_summary'  => 'Suspicious loitering detected near ATM machine, potential robbery casing activity.',
                'ai_advice'   => 'Avoid using this ATM alone. Use cashless payments where possible. Patrol unit notified.',
            ],
            [
                'title'       => 'Garbage Fire Near Residential Block',
                'description' => 'A pile of municipal garbage caught fire near Block D. Thick smoke is spreading toward nearby apartments.',
                'type'        => 'accident',
                'priority'    => 'high',
                'location'    => 'Block D Back Lane, Near Bin Station',
                'ai_summary'  => 'Garbage fire producing heavy smoke near residential buildings, potential inhalation hazard.',
                'ai_advice'   => 'Keep windows closed. Evacuate lower floors if smoke enters. Fire brigade has been alerted.',
            ],
            [
                'title'       => 'Stray Cattle Blocking Traffic',
                'description' => 'A herd of 8-10 stray cattle is standing on the main road, blocking vehicles in both directions.',
                'type'        => 'other',
                'priority'    => 'medium',
                'location'    => 'Main Road Junction, Near Bus Depot',
                'ai_summary'  => 'Stray cattle causing significant traffic disruption on main road.',
                'ai_advice'   => 'Avoid the main road. Take alternate routes. Do not honk aggressively near animals.',
            ],
            [
                'title'       => 'Chain Snatching Reported',
                'description' => 'A woman reported that her gold chain was snatched by a person on a motorcycle near the market entrance.',
                'type'        => 'crime',
                'priority'    => 'critical',
                'location'    => 'Market Gate, Western Entrance',
                'ai_summary'  => 'Chain snatching incident by motorcycle-borne suspect at market entrance.',
                'ai_advice'   => 'Avoid wearing visible jewellery in crowded areas. Police alerted with vehicle description.',
            ],
            [
                'title'       => 'Water Logging After Heavy Rain',
                'description' => 'The underpass near the school has flooded knee-deep after the rain. Children are having difficulty commuting.',
                'type'        => 'accident',
                'priority'    => 'medium',
                'location'    => 'School Underpass, Sector 6',
                'ai_summary'  => 'Flash flooding at school underpass creating dangerous conditions for commuters.',
                'ai_advice'   => 'Use alternate dry routes to school. Do not wade through stagnant water. Drainage team notified.',
            ],
            [
                'title'       => 'Unknown Vehicle Parked Suspiciously',
                'description' => 'A black SUV with no license plates has been parked in front of a residential building for 3 days with no activity.',
                'type'        => 'suspicious',
                'priority'    => 'medium',
                'location'    => 'Residency Block B, Parking Zone',
                'ai_summary'  => 'Unregistered vehicle parked for extended duration, possible abandoned vehicle or surveillance.',
                'ai_advice'   => 'Do not touch or approach the vehicle. Inform local traffic police for immediate check.',
            ],
            [
                'title'       => 'Transformer Box Vandalized',
                'description' => 'The electrical transformer junction box near the park has been broken open and wires are exposed, creating electrocution risk.',
                'type'        => 'accident',
                'priority'    => 'critical',
                'location'    => 'Central Park, Eastern Corner',
                'ai_summary'  => 'Vandalized transformer with exposed live wires presenting immediate electrocution risk to public.',
                'ai_advice'   => 'Keep at least 20 feet away. Do not let children near the area. Electricity board emergency line contacted.',
            ],
            [
                'title'       => 'Loud Argument / Domestic Disturbance',
                'description' => 'Neighbours report loud shouting and sounds of breaking objects from Apartment 4B. Has been going on for over an hour.',
                'type'        => 'suspicious',
                'priority'    => 'high',
                'location'    => 'Apartment Complex 4B, Tower 2',
                'ai_summary'  => 'Domestic disturbance with loud altercation and potential physical altercation sounds.',
                'ai_advice'   => 'Do not intervene directly. Call non-emergency helpline or police if sounds of physical harm are heard.',
            ],
            [
                'title'       => 'Dog Bite Incident at Park',
                'description' => 'A stray dog bit a 10-year-old child who was playing in the community park this afternoon.',
                'type'        => 'accident',
                'priority'    => 'high',
                'location'    => 'Community Children Park, Sector 3',
                'ai_summary'  => 'Child bitten by stray dog at public park, requires immediate medical attention and rabies assessment.',
                'ai_advice'   => 'Seek immediate medical attention. Clean wound with running water. Report to animal control for dog capture.',
            ],
            [
                'title'       => 'Smoke Detected in Stairwell',
                'description' => 'Residents on floors 3-5 of Tower C are reporting a burning smell and light smoke visible in the stairwell area.',
                'type'        => 'accident',
                'priority'    => 'critical',
                'location'    => 'Tower C Stairwell, Floor 3-5',
                'ai_summary'  => 'Unexplained smoke and burning smell in apartment building stairwell, possible electrical or trash fire.',
                'ai_advice'   => 'Do not use elevators. Evacuate via fire exits. Fire brigade alerted. Assemble at ground floor muster point.',
            ],
        ];

        $template = $templates[array_rand($templates)];

        // Get a random resident/responder in this neighborhood to be the "reporter"
        $reporter = User::where('neighborhood_name', $neighborhoodName)
            ->where('role', '!=', 'super_admin')
            ->inRandomOrder()
            ->first();

        if (!$reporter) {
            $reporter = $admin;
        }

        // Generate location within neighborhood boundary
        list($lat, $lng) = $this->getRandomPoint($admin);

        // Create the simulated report
        Report::create([
            'user_id'     => $reporter->id,
            'title'       => $template['title'],
            'description' => $template['description'],
            'type'        => $template['type'],
            'priority'    => $template['priority'],
            'location'    => $template['location'],
            'ai_summary'  => $template['ai_summary'],
            'ai_advice'   => $template['ai_advice'],
            'datetime'    => \Carbon\Carbon::now(),
            'status'      => 'pending',
            'latitude'    => $lat,
            'longitude'   => $lng,
            'is_simulated'=> true,
        ]);

        // Clear dashboard and analytics cache
        cache()->forget("dashboard_stats_{$neighborhoodName}");
        cache()->forget("analytics_stats_{$neighborhoodName}");

        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json(['success' => true, 'message' => 'Demo incident pushed successfully.']);
        }

        return back()->with('success', 'Demo incident pushed dynamically successfully!');
    }

    /** Generate a random lat/lng within the admin's neighborhood boundary */
    private function getRandomPoint($admin): array
    {
        $centerLat = floatval($admin->neighborhood_lat ?: 28.6139);
        $centerLng = floatval($admin->neighborhood_lng ?: 77.2090);

        if (!empty($admin->neighborhood_boundary)) {
            try {
                $boundary = json_decode($admin->neighborhood_boundary, true);
                $polygon  = $boundary['features'][0]['geometry']['coordinates'][0] ?? null;

                if ($polygon && $boundary['features'][0]['geometry']['type'] === 'Polygon') {
                    $minLng = $maxLng = $polygon[0][0];
                    $minLat = $maxLat = $polygon[0][1];

                    foreach ($polygon as $coord) {
                        $minLng = min($minLng, $coord[0]);
                        $maxLng = max($maxLng, $coord[0]);
                        $minLat = min($minLat, $coord[1]);
                        $maxLat = max($maxLat, $coord[1]);
                    }

                    for ($i = 0; $i < 50; $i++) {
                        $rLng = $minLng + (mt_rand() / mt_getrandmax()) * ($maxLng - $minLng);
                        $rLat = $minLat + (mt_rand() / mt_getrandmax()) * ($maxLat - $minLat);
                        if ($this->pointInPolygon($rLng, $rLat, $polygon)) {
                            return [$rLat, $rLng];
                        }
                    }
                }
            } catch (\Throwable) {}
        }

        $offsetLat = (mt_rand() / mt_getrandmax() * 0.004) - 0.002;
        $offsetLng = (mt_rand() / mt_getrandmax() * 0.004) - 0.002;
        return [$centerLat + $offsetLat, $centerLng + $offsetLng];
    }

    private function pointInPolygon(float $x, float $y, array $polygon): bool
    {
        $inside = false;
        $n      = count($polygon);
        for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
            $xi = $polygon[$i][0]; $yi = $polygon[$i][1];
            $xj = $polygon[$j][0]; $yj = $polygon[$j][1];
            if ((($yi > $y) !== ($yj > $y)) && ($x < ($xj - $xi) * ($y - $yi) / ($yj - $yi) + $xi)) {
                $inside = !$inside;
            }
        }
        return $inside;
    }
}

<?php

namespace App\Console\Commands;

use App\Models\Report;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SimulateIncidents extends Command
{
    protected $signature   = 'simulate:incidents {--once : Run only one incident immediately}';
    protected $description = 'Auto-generate realistic simulation incidents across all active neighborhoods.';

    /** Realistic incident templates for simulation */
    private array $templates = [
        [
            'title'       => 'Suspicious Individual Near ATM',
            'description' => 'A hooded individual has been seen loitering around the ATM machine for over 30 minutes, watching people withdraw cash.',
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
        [
            'title'       => 'Illegal Parking Blocking Fire Hydrant',
            'description' => 'Multiple vehicles parked illegally are blocking the fire hydrant access on Block A main road, creating a safety hazard.',
            'type'        => 'other',
            'priority'    => 'low',
            'location'    => 'Block A Main Road, Fire Hydrant Point',
            'ai_summary'  => 'Illegally parked vehicles blocking fire hydrant access, compromising emergency response capability.',
            'ai_advice'   => 'Traffic warden notified. Tow truck request placed. Do not block emergency infrastructure.',
        ],
        [
            'title'       => 'Broken Glass on Children\'s Play Area',
            'description' => 'Broken alcohol bottles have been discovered scattered across the children\'s sand play area in the morning.',
            'type'        => 'other',
            'priority'    => 'medium',
            'location'    => 'Kids Zone, Sector 7 Park',
            'ai_summary'  => 'Broken glass bottles found in children\'s play zone, posing serious injury risk to children.',
            'ai_advice'   => 'Keep children away from the park until cleaned. Sanitation team dispatched for immediate cleanup.',
        ],
    ];

    public function handle(): int
    {
        // Get all active admin neighborhoods
        $admins = User::where('role', 'admin')
            ->where('status', 'approved')
            ->whereNotNull('neighborhood_name')
            ->whereNotNull('neighborhood_lat')
            ->whereNotNull('neighborhood_lng')
            ->get();

        if ($admins->isEmpty()) {
            $this->info('[Simulation] No active admin neighborhoods found. Skipping.');
            return self::SUCCESS;
        }

        $count = 0;

        foreach ($admins as $admin) {
            // Only generate for neighborhoods that have at least some data (were seeded before)
            $hasData = Report::whereHas('user', fn($q) => $q->where('neighborhood_name', $admin->neighborhood_name))->exists();
            if (!$hasData) {
                continue;
            }

            // Pick a random template
            $template = $this->templates[array_rand($this->templates)];

            // Get a random resident/responder in this neighborhood to be the "reporter"
            $reporter = User::where('neighborhood_name', $admin->neighborhood_name)
                ->where('role', '!=', 'super_admin')
                ->inRandomOrder()
                ->first();

            if (!$reporter) {
                continue;
            }

            // Generate location within neighborhood boundary
            [$lat, $lng] = $this->getRandomPoint($admin);

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
                'datetime'    => Carbon::now(),
                'status'      => 'pending',
                'latitude'    => $lat,
                'longitude'   => $lng,
                'is_simulated'=> true,
            ]);

            // Clear dashboard cache so next load shows new data
            cache()->forget("dashboard_stats_{$admin->neighborhood_name}");
            cache()->forget("analytics_stats_{$admin->neighborhood_name}");

            $count++;
            $this->info("[Simulation] ✓ Generated: \"{$template['title']}\" in {$admin->neighborhood_name}");
        }

        // Auto-resolve some old pending simulated incidents (lifecycle simulation)
        $changed = $this->autoResolveOldSimulations();

        // Clear caches for all approved admins' neighborhoods to be 100% safe
        if ($count > 0 || $changed) {
            foreach ($admins as $admin) {
                cache()->forget("dashboard_stats_{$admin->neighborhood_name}");
                cache()->forget("analytics_stats_{$admin->neighborhood_name}");
                cache()->forget("heatmap_reports_{$admin->neighborhood_name}");
                cache()->forget("global_chat_context");
            }
        }

        $this->info("[Simulation] Done. Generated {$count} incident(s).");
        return self::SUCCESS;
    }

    /** Auto-resolve simulated incidents older than 15 minutes to keep data cycling */
    private function autoResolveOldSimulations(): bool
    {
        $resolved = Report::where('is_simulated', true)
            ->where('status', 'pending')
            ->where('created_at', '<', Carbon::now()->subMinutes(15))
            ->update([
                'status'     => collect(['investigating', 'resolved'])->random(),
                'updated_at' => Carbon::now(),
            ]);

        if ($resolved > 0) {
            $this->info("[Simulation] Auto-resolved {$resolved} stale pending simulation(s).");
        }

        // Clean up very old resolved simulated incidents (older than 2 hours) to avoid DB bloat
        $deleted = Report::where('is_simulated', true)
            ->where('status', 'resolved')
            ->where('updated_at', '<', Carbon::now()->subHours(2))
            ->delete();

        if ($deleted > 0) {
            $this->info("[Simulation] Cleaned up {$deleted} old resolved simulation(s).");
        }

        return ($resolved > 0 || $deleted > 0);
    }

    /** Generate a random lat/lng within the admin's neighborhood boundary */
    private function getRandomPoint(User $admin): array
    {
        $centerLat = floatval($admin->neighborhood_lat);
        $centerLng = floatval($admin->neighborhood_lng);

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

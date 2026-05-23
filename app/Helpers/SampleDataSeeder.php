<?php

namespace App\Helpers;

use App\Models\User;
use App\Models\Report;
use App\Models\SosAlert;
use App\Models\Announcement;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class SampleDataSeeder
{
    public static function seedIfNeeded($user, $force = false)
    {
        $neighborhoodName = $user->neighborhood_name;
        if (empty($neighborhoodName)) {
            return;
        }

        // Check if there are any reports in this neighborhood
        $reportsCount = Report::whereHas('user', function($q) use ($neighborhoodName) {
            $q->where('neighborhood_name', $neighborhoodName);
        })->count();

        if (!$force && $reportsCount > 0) {
            // Already seeded or has data
            return;
        }

        // Clear the cache for this neighborhood first to ensure immediate update
        cache()->forget("dashboard_stats_{$neighborhoodName}");

        // Find the admin of this neighborhood to get the center lat/lng
        $admin = User::where('role', 'admin')
            ->where('neighborhood_name', $neighborhoodName)
            ->first();

        $centerLat = $admin ? floatval($admin->neighborhood_lat) : 28.6139;
        $centerLng = $admin ? floatval($admin->neighborhood_lng) : 77.2090;

        // 1. Create Sample Residents and a Responder in this neighborhood
        $responder = User::firstOrCreate(
            ['email' => 'jane.responder@' . strtolower(str_replace(' ', '', $neighborhoodName)) . '.com'],
            [
                'name' => 'Officer Jane Cooper',
                'password' => Hash::make('password'),
                'role' => 'responder',
                'status' => 'approved',
                'neighborhood_name' => $neighborhoodName,
                'neighborhood_lat' => $centerLat,
                'neighborhood_lng' => $centerLng,
            ]
        );

        $resident1 = User::firstOrCreate(
            ['email' => 'sarah.connor@' . strtolower(str_replace(' ', '', $neighborhoodName)) . '.com'],
            [
                'name' => 'Sarah Connor',
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'pending',
                'neighborhood_name' => $neighborhoodName,
                'neighborhood_lat' => $centerLat,
                'neighborhood_lng' => $centerLng,
            ]
        );

        $resident2 = User::firstOrCreate(
            ['email' => 'david.miller@' . strtolower(str_replace(' ', '', $neighborhoodName)) . '.com'],
            [
                'name' => 'David Miller',
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'pending',
                'neighborhood_name' => $neighborhoodName,
                'neighborhood_lat' => $centerLat,
                'neighborhood_lng' => $centerLng,
            ]
        );

        $resident3 = User::firstOrCreate(
            ['email' => 'emma.watson@' . strtolower(str_replace(' ', '', $neighborhoodName)) . '.com'],
            [
                'name' => 'Emma Watson',
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'pending',
                'neighborhood_name' => $neighborhoodName,
                'neighborhood_lat' => $centerLat,
                'neighborhood_lng' => $centerLng,
            ]
        );

        $resident4 = User::firstOrCreate(
            ['email' => 'james.smith@' . strtolower(str_replace(' ', '', $neighborhoodName)) . '.com'],
            [
                'name' => 'James Smith',
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'pending',
                'neighborhood_name' => $neighborhoodName,
                'neighborhood_lat' => $centerLat,
                'neighborhood_lng' => $centerLng,
            ]
        );

        $usersPool = [$resident1, $resident2, $resident3, $resident4, $user];

        // 2. Define beautiful and realistic reports
        $sampleIncidents = [
            [
                'title' => 'Suspicious Drone Activity Over Houses',
                'description' => 'A small white drone has been hovering low over several backyards on Maple Street for the past 20 minutes. It seems to be recording private property.',
                'type' => 'suspicious',
                'priority' => 'medium',
                'location' => 'Maple Street, near Central Park',
                'image' => 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800',
                'ai_summary' => 'Residents reported a low-flying white drone hovering over residential backyards, raising privacy and potential surveillance concerns.',
                'ai_advice' => 'Keep windows and blinds closed. Document drone details (color, size, direction) and report to local non-emergency line if it persists.',
                'status' => 'pending',
                'offset_lat' => 0.0042,
                'offset_lng' => -0.0035,
                'days_ago' => 0,
                'hour' => 14,
            ],
            [
                'title' => 'Water Mains Burst on Main Street',
                'description' => 'Huge water leakage from the main pipeline. The road is flooded with almost 5-6 inches of water, slowing down traffic and creating a safety hazard for pedestrians.',
                'type' => 'accident',
                'priority' => 'high',
                'location' => 'Main Street & 4th Avenue Junction',
                'image' => 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=800',
                'ai_summary' => 'Water main pipe rupture causing major street flooding (5-6 inches deep), disrupting traffic and creating pedestrian safety hazards.',
                'ai_advice' => 'Avoid the Main Street corridor. Drive slowly through surrounding detours. Authorities have been alerted to shut off the main valve.',
                'status' => 'investigating',
                'offset_lat' => -0.0025,
                'offset_lng' => 0.0081,
                'days_ago' => 1,
                'hour' => 9,
                'assign_to_responder' => true,
            ],
            [
                'title' => 'Stray Dog Pack Near Play Area',
                'description' => 'A pack of 5-6 aggressive stray dogs has gathered near the community children\'s park. They have been barking and chasing joggers and children.',
                'type' => 'other',
                'priority' => 'medium',
                'location' => 'Greenwood Playground Entrance',
                'image' => 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
                'ai_summary' => 'Aggressive pack of stray dogs loitering at the park entrance, posing safety risks to joggers and children.',
                'ai_advice' => 'Do not approach or feed the dogs. Avoid running near them. Walk in groups and keep children close. Animal control is being contacted.',
                'status' => 'pending',
                'offset_lat' => 0.0068,
                'offset_lng' => 0.0053,
                'days_ago' => 2,
                'hour' => 18,
            ],
            [
                'title' => 'Shoplifting Attempt at Local Store',
                'description' => 'Two individuals were caught on camera trying to steal merchandise from the convenience store. They fled in a black sedan when confronted by the shopkeeper.',
                'type' => 'crime',
                'priority' => 'high',
                'location' => 'SuperMart Express, Sector 4',
                'image' => 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
                'ai_summary' => 'Shoplifting incident at local store involving two suspects who fled in a vehicle after being confronted.',
                'ai_advice' => 'Store owners should review camera footage. Do not try to physically apprehend suspects. Share vehicle description and license plate with local police.',
                'status' => 'resolved',
                'offset_lat' => -0.0075,
                'offset_lng' => -0.0062,
                'days_ago' => 3,
                'hour' => 20,
                'assign_to_responder' => true,
            ],
            [
                'title' => 'Power Transformer Sparking Heavily',
                'description' => 'The electric power transformer on the corner pole is sparking violently and emitting loud humming sounds. Potential fire hazard.',
                'type' => 'accident',
                'priority' => 'critical',
                'location' => 'Oak Avenue & Pine Lane',
                'image' => 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800',
                'ai_summary' => 'Heavy electrical sparking and loud noise from a roadside transformer, posing an immediate electrical fire and outage risk.',
                'ai_advice' => 'Maintain a safe distance of at least 50 feet. Do not stand under power lines. Electrical department has been requested for emergency shutdown.',
                'status' => 'resolved',
                'offset_lat' => 0.0011,
                'offset_lng' => -0.0089,
                'days_ago' => 4,
                'hour' => 23,
                'assign_to_responder' => true,
            ],
            [
                'title' => 'Flickering Streetlight / Dark Spot',
                'description' => 'The streetlights in the alley behind Block C are completely dead, leaving the entire stretch dark. This is a known hotspot for suspicious activity.',
                'type' => 'other',
                'priority' => 'low',
                'location' => 'Block C Back Alleyway',
                'image' => 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&q=80&w=800',
                'ai_summary' => 'Dead streetlights in Block C alleyway creating dark zones, raising resident concerns regarding security.',
                'ai_advice' => 'Avoid walking through the dark alleyway alone at night. Use a flashlight or your phone light if necessary. Maintenance ticket logged.',
                'status' => 'investigating',
                'offset_lat' => -0.0018,
                'offset_lng' => 0.0039,
                'days_ago' => 5,
                'hour' => 21,
            ],
            [
                'title' => 'Graffiti Tagging on Community Center',
                'description' => 'Fresh spray-paint graffiti appeared overnight on the east wall of the community center. Appears to be gang-related symbols.',
                'type' => 'crime',
                'priority' => 'low',
                'location' => 'Civic Center, Main Lobby Wall',
                'image' => 'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?auto=format&fit=crop&q=80&w=800',
                'ai_summary' => 'Overnight graffiti on the community center walls with symbols, indicating minor vandalism.',
                'ai_advice' => 'Report symbols to police gang unit for identification. Clean or paint over the wall as soon as possible to discourage repeat incidents.',
                'status' => 'resolved',
                'offset_lat' => 0.0085,
                'offset_lng' => -0.0012,
                'days_ago' => 6,
                'hour' => 3,
            ],
            [
                'title' => 'Speeding Bikes / Loud Exhaust Noise',
                'description' => 'A group of sports bikes are racing up and down the boulevard late at night, creating deafening exhaust noise and risking pedestrian safety.',
                'type' => 'accident',
                'priority' => 'medium',
                'location' => 'Grand Boulevard, North Corridor',
                'image' => 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
                'ai_summary' => 'Late-night motorcycle street racing and noise disturbance along Grand Boulevard, creating noise pollution and pedestrian safety risks.',
                'ai_advice' => 'Stay away from curbs when walk-exercising. Report license plates if visible. Police patrol requested for speed monitoring.',
                'status' => 'pending',
                'offset_lat' => -0.0051,
                'offset_lng' => -0.0028,
                'days_ago' => 0,
                'hour' => 22,
            ],
            [
                'title' => 'Illegal Industrial Garbage Dumping',
                'description' => 'A commercial truck was seen dumping heavy construction debris and bags of trash on the vacant lot next to the park.',
                'type' => 'other',
                'priority' => 'medium',
                'location' => 'Vacant Plot, Near City Park East',
                'image' => 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800',
                'ai_summary' => 'Unauthorized dumping of commercial construction waste and household trash by a commercial vehicle on a vacant community plot.',
                'ai_advice' => 'Do not approach waste as it may contain hazardous materials. Note vehicle license numbers and company names to report to sanitation department.',
                'status' => 'investigating',
                'offset_lat' => 0.0029,
                'offset_lng' => 0.0076,
                'days_ago' => 2,
                'hour' => 11,
                'assign_to_responder' => true,
            ],
            [
                'title' => 'Suspicious Lock Inspection on Garage',
                'description' => 'A person carrying a duffel bag was seen walking around the back garages, closely inspecting the padlocks and pulling on garage doors.',
                'type' => 'suspicious',
                'priority' => 'high',
                'location' => 'Block F Residential Alley',
                'image' => 'https://images.unsplash.com/photo-1508847154043-be12a62861c1?auto=format&fit=crop&q=80&w=800',
                'ai_summary' => 'Individual carrying a duffel bag observed testing door locks and padlocks behind residential garages, suggesting casing for burglary.',
                'ai_advice' => 'Ensure all double-bolt locks are locked. Turn on outdoor motion security lights. Keep vehicles inside garages locked and keys hidden.',
                'status' => 'pending',
                'offset_lat' => -0.0038,
                'offset_lng' => -0.0095,
                'days_ago' => 1,
                'hour' => 2,
            ],
            [
                'title' => 'Accident: Car Skidded Into Pole',
                'description' => 'A white hatchback lost control on the wet road and skidded straight into the concrete utility pole. The driver is safe but the road is partially blocked.',
                'type' => 'accident',
                'priority' => 'high',
                'location' => 'Boulevard Main Crossing',
                'image' => 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
                'ai_summary' => 'Single-vehicle collision with utility pole due to wet pavement. No major injuries, but partial road blockage and traffic delays.',
                'ai_advice' => 'Drive with caution around the junction. Tow truck and emergency services dispatched to clear the lane.',
                'status' => 'resolved',
                'offset_lat' => 0.0059,
                'offset_lng' => -0.0074,
                'days_ago' => 5,
                'hour' => 8,
                'assign_to_responder' => true,
            ],
            [
                'title' => 'Loitering Near ATM Lobby',
                'description' => 'Three individuals have been sitting inside the ATM vestibule for hours, drinking and intimidating customers who try to withdraw cash.',
                'type' => 'suspicious',
                'priority' => 'medium',
                'location' => 'National Bank ATM, Market Square',
                'image' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800',
                'ai_summary' => 'Group loitering inside bank ATM vestibule, intimidating customers and consuming alcohol.',
                'ai_advice' => 'Avoid using this ATM location alone. Use credit/debit cards or another well-lit terminal. Bank security and patrol notified.',
                'status' => 'investigating',
                'offset_lat' => -0.0091,
                'offset_lng' => 0.0022,
                'days_ago' => 3,
                'hour' => 19,
                'assign_to_responder' => true,
            ]
        ];

        // Seed Reports
        foreach ($sampleIncidents as $incident) {
            $reporter = $usersPool[array_rand($usersPool)];
            $dt = Carbon::now()->subDays($incident['days_ago'])->setHour($incident['hour'])->setMinute(rand(0, 59));

            // Get a random point inside the admin's drawn polygon (or fallback close to center)
            list($lat, $lng) = self::getRandomPointInBoundary($admin, $centerLat, $centerLng);

            $report = new Report([
                'user_id' => $reporter->id,
                'responder_id' => (!empty($incident['assign_to_responder']) && $responder) ? $responder->id : null,
                'title' => $incident['title'],
                'description' => $incident['description'],
                'type' => $incident['type'],
                'priority' => $incident['priority'],
                'location' => $incident['location'],
                'image' => $incident['image'],
                'datetime' => $dt,
                'status' => $incident['status'],
                'latitude' => $lat,
                'longitude' => $lng,
                'ai_summary' => $incident['ai_summary'],
                'ai_advice' => $incident['ai_advice'],
                'spam_score' => rand(1, 10),
                'is_flagged' => false,
            ]);
            $report->created_at = $dt;
            if ($incident['status'] === 'resolved') {
                // Resolved reports took 2 to 6 hours to complete
                $report->updated_at = (clone $dt)->addHours(rand(2, 6));
            } else {
                $report->updated_at = $dt;
            }
            $report->save();
        }

        // 3. Seed Announcements
        $sampleAnnouncements = [
            [
                'title' => 'Community Safety Meeting',
                'content' => 'Join us this Saturday at 10:00 AM in the Community Hall to discuss neighborhood safety measures, security cameras, and patrol routes.',
                'type' => 'info',
            ],
            [
                'title' => 'High Spark Danger & Transformer Upgrades',
                'content' => 'The local power grid department will perform upgrades on the Oak Avenue transformer this Thursday. Expect minor power cuts between 1 PM and 5 PM.',
                'type' => 'warning',
            ],
            [
                'title' => 'Burglary Warning: Lock Your Garage Doors',
                'content' => 'Recent reports of suspicious loitering near garages have been reported. Please ensure all garages and back doors are double-locked, and security lights are functional.',
                'type' => 'critical',
            ]
        ];

        foreach ($sampleAnnouncements as $ann) {
            Announcement::create([
                'user_id' => $admin ? $admin->id : $user->id,
                'title' => $ann['title'],
                'content' => $ann['content'],
                'type' => $ann['type'],
                'is_active' => true,
            ]);
        }
    }

    private static function getRandomPointInBoundary($admin, $centerLat, $centerLng)
    {
        if ($admin && !empty($admin->neighborhood_boundary)) {
            try {
                $boundary = json_decode($admin->neighborhood_boundary, true);
                if (
                    isset($boundary['features'][0]['geometry']['coordinates'][0]) &&
                    $boundary['features'][0]['geometry']['type'] === 'Polygon'
                ) {
                    $polygon = $boundary['features'][0]['geometry']['coordinates'][0];
                    
                    // Bounding box
                    $minLng = $polygon[0][0];
                    $maxLng = $polygon[0][0];
                    $minLat = $polygon[0][1];
                    $maxLat = $polygon[0][1];
                    
                    foreach ($polygon as $coord) {
                        $minLng = min($minLng, $coord[0]);
                        $maxLng = max($maxLng, $coord[0]);
                        $minLat = min($minLat, $coord[1]);
                        $maxLat = max($maxLat, $coord[1]);
                    }
                    
                    // Try to find a point inside the polygon
                    for ($attempt = 0; $attempt < 100; $attempt++) {
                        $randLng = $minLng + (mt_rand() / mt_getrandmax()) * ($maxLng - $minLng);
                        $randLat = $minLat + (mt_rand() / mt_getrandmax()) * ($maxLat - $minLat);
                        
                        if (self::isPointInPolygon($randLng, $randLat, $polygon)) {
                            return [$randLat, $randLng];
                        }
                    }
                    
                    // Fallback to center of bounding box
                    return [($minLat + $maxLat) / 2, ($minLng + $maxLng) / 2];
                }
            } catch (\Exception $e) {
                // Fall back to center with small offset
            }
        }
        
        // No boundary polygon: generate point close to center (within ~150 meters)
        $offsetLat = (mt_rand() / mt_getrandmax() * 0.002) - 0.001;
        $offsetLng = (mt_rand() / mt_getrandmax() * 0.002) - 0.001;
        return [$centerLat + $offsetLat, $centerLng + $offsetLng];
    }

    private static function isPointInPolygon($x, $y, $polygon)
    {
        $inside = false;
        $n = count($polygon);
        for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
            $xi = $polygon[$i][0]; $yi = $polygon[$i][1];
            $xj = $polygon[$j][0]; $yj = $polygon[$j][1];
            
            $intersect = (($yi > $y) != ($yj > $y))
                && ($x < ($xj - $xi) * ($y - $yi) / ($yj - $yi) + $xi);
            if ($intersect) {
                $inside = !$inside;
            }
        }
        return $inside;
    }
}

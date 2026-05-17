<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@safety.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'status' => 'approved',
                'neighborhood_name' => 'Greenwood Valley Safety Corridor',
                'neighborhood_lat' => 28.6139,
                'neighborhood_lng' => 77.2090,
            ]
        );

        // Create Super Admin User
        \App\Models\User::firstOrCreate(
            ['email' => 'superadmin@safety.com'],
            [
                'name' => 'Master Super Admin',
                'password' => bcrypt('password'),
                'role' => 'super_admin',
                'status' => 'approved',
            ]
        );

        // Create Regular User
        $user = \App\Models\User::firstOrCreate(
            ['email' => 'john@example.com'],
            [
                'name' => 'John Doe',
                'password' => bcrypt('password'),
                'role' => 'user',
                'status' => 'approved',
                'neighborhood_name' => 'Greenwood Valley Safety Corridor',
                'neighborhood_lat' => 28.6139,
                'neighborhood_lng' => 77.2090,
            ]
        );

        // Create Sample Reports
        \App\Models\Report::firstOrCreate(
            ['title' => 'Suspicious car in driveway'],
            [
                'user_id' => $user->id,
                'description' => 'A black sedan has been idling in front of my neighbor\'s house for over 30 minutes with its lights off.',
                'type' => 'suspicious',
                'location' => 'Oak Street, North Side',
                'datetime' => now()->subHours(2),
                'status' => 'pending',
            ]
        );

        \App\Models\Report::firstOrCreate(
            ['title' => 'Broken street light'],
            [
                'user_id' => $user->id,
                'description' => 'The street light at the corner of 5th and Main is flickering and creating a safety hazard at night.',
                'type' => 'other',
                'location' => '5th & Main Intersection',
                'datetime' => now()->subDays(1),
                'status' => 'resolved',
            ]
        );
    }
}

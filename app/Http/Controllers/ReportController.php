<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::with('user');

        // Filter by user's neighborhood if logged in and not super_admin
        $neighborhoodLat = 37.7749;
        $neighborhoodLng = -122.4194;
        $neighborhoodBoundary = null;
        $neighborhoodName = null;

        if (auth()->check() && auth()->user()->role !== 'super_admin') {
            $neighborhoodName = auth()->user()->neighborhood_name;
            $query->whereHas('user', function($q) use ($neighborhoodName) {
                $q->where('neighborhood_name', $neighborhoodName);
            });

            $meta = $this->getNeighborhoodMeta($neighborhoodName);
            $neighborhoodLat = $meta['lat'];
            $neighborhoodLng = $meta['lng'];
            $neighborhoodBoundary = $meta['boundary'];
        }

        if ($request->has('lat') && $request->has('lng')) {
            $lat = (float) $request->lat;
            $lng = (float) $request->lng;
            $radius = 5; // 5 kilometers

            $haversine = "(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))";

            $query->select('*')
                  ->selectRaw("{$haversine} AS distance", [$lat, $lng, $lat])
                  ->whereNotNull('latitude')
                  ->whereNotNull('longitude')
                  ->whereRaw("{$haversine} < ?", [$lat, $lng, $lat, $radius])
                  ->orderBy('distance');
        } else {
            $query->latest();
        }

        if ($request->has('type') && $request->type != '') {
            $query->where('type', $request->type);
        }

        if ($request->has('search') && $request->search != '') {
            $query->where('location', 'like', '%' . $request->search . '%');
        }

        $reports = $query->paginate(10)->withQueryString();

        return \Inertia\Inertia::render('Reports/Index', compact('reports', 'neighborhoodLat', 'neighborhoodLng', 'neighborhoodBoundary', 'neighborhoodName'));
    }

    public function create()
    {
        $neighborhoodName = auth()->user()->neighborhood_name;
        $meta = $this->getNeighborhoodMeta($neighborhoodName);

        $neighborhoodLat = $meta['lat'];
        $neighborhoodLng = $meta['lng'];
        $neighborhoodBoundary = $meta['boundary'];

        return \Inertia\Inertia::render('Reports/Create', compact('neighborhoodLat', 'neighborhoodLng', 'neighborhoodBoundary', 'neighborhoodName'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:crime,accident,suspicious,other',
            'location' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'datetime' => 'required|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $data = $request->except('image');
        $data['user_id'] = auth()->id();
        $data['status'] = 'pending';

        // Smart Threat Prioritization Logic
        $priorityMapping = [
            'crime' => 'high',
            'accident' => 'critical',
            'suspicious' => 'medium',
            'other' => 'low'
        ];
        $data['priority'] = $priorityMapping[$request->type] ?? 'low';

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            
            // Smart WebP Compression using GD Library (95%+ file size reduction)
            if (extension_loaded('gd')) {
                $imageInfo = getimagesize($file->getRealPath());
                if ($imageInfo) {
                    $mime = $imageInfo['mime'];
                    $src = null;
                    if ($mime == 'image/jpeg' || $mime == 'image/jpg') {
                        $src = @imagecreatefromjpeg($file->getRealPath());
                    } elseif ($mime == 'image/png') {
                        $src = @imagecreatefrompng($file->getRealPath());
                    }

                    if ($src) {
                        // Ensure reports directory exists
                        if (!Storage::disk('public')->exists('reports')) {
                            Storage::disk('public')->makeDirectory('reports');
                        }

                        $filename = 'reports/' . uniqid() . '.webp';
                        $path = storage_path('app/public/' . $filename);
                        
                        // Convert & compress to webp format at 80% quality
                        if (imagewebp($src, $path, 80)) {
                            $data['image'] = $filename;
                        } else {
                            $data['image'] = $file->store('reports', 'public');
                        }
                        imagedestroy($src);
                    } else {
                        $data['image'] = $file->store('reports', 'public');
                    }
                } else {
                    $data['image'] = $file->store('reports', 'public');
                }
            } else {
                $data['image'] = $file->store('reports', 'public');
            }
        }

        $report = Report::create($data);

        // Clear dashboard, analytics, and heatmap cache to show fresh data instantly
        $neighborhoodName = auth()->user()->neighborhood_name;
        cache()->forget("dashboard_stats_{$neighborhoodName}");
        cache()->forget("analytics_stats_{$neighborhoodName}");
        cache()->forget("heatmap_reports_{$neighborhoodName}");

        // Fire real-time notification
        event(new \App\Events\IncidentReported($report));

        return redirect()->route('reports.index')->with('success', 'Incident reported successfully.');
    }

    public function myReports()
    {
        $reports = auth()->user()->reports()->latest()->paginate(10);
        return \Inertia\Inertia::render('Reports/MyReports', compact('reports'));
    }

    public function assignments()
    {
        $user = auth()->user();
        if ($user->role !== 'responder' && $user->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $neighborhoodName = $user->neighborhood_name;

        if ($user->role === 'admin') {
            // Admins can see all active assignments across responders in their own neighborhood
            $reports = Report::whereNotNull('responder_id')
                ->whereHas('user', function($q) use ($neighborhoodName) {
                    $q->where('neighborhood_name', $neighborhoodName);
                })
                ->with('responder', 'user')->latest()->paginate(10);
        } else {
            // Responders see only their own assignments
            $reports = $user->assignedReports()->with('user')->latest()->paginate(10);
        }

        return \Inertia\Inertia::render('Reports/Assignments', compact('reports'));
    }

    public function resolveAssigned(Report $report)
    {
        $user = auth()->user();
        if ($user->role !== 'admin' && ($user->role !== 'responder' || $user->id !== $report->responder_id)) {
            abort(403, 'Unauthorized action.');
        }

        $report->update(['status' => 'resolved']);

        $neighborhoodName = $user->neighborhood_name;
        cache()->forget("dashboard_stats_{$neighborhoodName}");
        cache()->forget("analytics_stats_{$neighborhoodName}");
        cache()->forget("heatmap_reports_{$neighborhoodName}");

        return back()->with('success', 'Incident marked as resolved.');
    }

    public function volunteer(Report $report)
    {
        if (auth()->user()->role !== 'responder') {
            abort(403, 'Unauthorized action.');
        }

        if ($report->responder_id !== null) {
            return back()->with('error', 'This incident is already assigned to a responder.');
        }

        $report->update([
            'responder_id' => auth()->id(),
            'status' => 'investigating'
        ]);

        $neighborhoodName = auth()->user()->neighborhood_name;
        cache()->forget("dashboard_stats_{$neighborhoodName}");
        cache()->forget("analytics_stats_{$neighborhoodName}");
        cache()->forget("heatmap_reports_{$neighborhoodName}");

        return back()->with('success', 'You have successfully volunteered to respond to this incident!');
    }

    public function show(Report $report)
    {
        $report->load('user', 'responder');
        return \Inertia\Inertia::render('Reports/Show', compact('report'));
    }

    public function downloadPDF(Report $report)
    {
        // Check if user is authorized (Admin or the person who reported it)
        if (auth()->user()->role !== 'admin' && auth()->id() !== $report->user_id) {
            abort(403, 'Unauthorized action.');
        }

        $report->load('user');
        $pdf = Pdf::loadView('reports.pdf', compact('report'));
        
        return $pdf->download('Incident-Report-'.$report->id.'.pdf');
    }

    public function heatmap()
    {
        $neighborhoodName = auth()->user()->neighborhood_name;
        $meta = $this->getNeighborhoodMeta($neighborhoodName);

        $neighborhoodLat = $meta['lat'];
        $neighborhoodLng = $meta['lng'];
        $neighborhoodBoundary = $meta['boundary'];

        // Get all reports with coordinates within the user's neighborhood (cached)
        $reportsCacheKey = "heatmap_reports_{$neighborhoodName}";
        $reports = cache()->remember($reportsCacheKey, 300, function() use ($neighborhoodName) {
            return Report::whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->whereHas('user', function($q) use ($neighborhoodName) {
                    $q->where('neighborhood_name', $neighborhoodName);
                })->get();
        });

        return \Inertia\Inertia::render('Reports/Heatmap', compact('reports', 'neighborhoodLat', 'neighborhoodLng', 'neighborhoodBoundary', 'neighborhoodName'));
    }

    /**
     * Retrieve neighborhood coordinates and boundary map data from cache.
     */
    private function getNeighborhoodMeta($neighborhoodName)
    {
        if (empty($neighborhoodName)) {
            return [
                'lat' => 37.7749,
                'lng' => -122.4194,
                'boundary' => null
            ];
        }

        return cache()->remember("neighborhood_meta_{$neighborhoodName}", 86400, function() use ($neighborhoodName) {
            $admin = \App\Models\User::where('role', 'admin')
                ->where('neighborhood_name', $neighborhoodName)
                ->first();

            return [
                'lat' => $admin ? floatval($admin->neighborhood_lat) : 37.7749,
                'lng' => $admin ? floatval($admin->neighborhood_lng) : -122.4194,
                'boundary' => $admin ? $admin->neighborhood_boundary : null,
            ];
        });
    }
}

<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SosAlertController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return \Inertia\Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/language/{locale}', function ($locale) {
    if (in_array($locale, ['en', 'hi'])) {
        session()->put('locale', $locale);
    }
    return redirect()->back();
})->name('language.switch');

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    
    // Profile Routes (From Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Approved User Routes
    Route::middleware(['approved'])->group(function () {
        
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard/live-stats', [DashboardController::class, 'liveStats'])->name('dashboard.live-stats');

        // Public Announcements for All Users
        Route::get('/announcements', [\App\Http\Controllers\AnnouncementController::class, 'publicIndex'])->name('announcements.list');

        // Incident Reports
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/create', [ReportController::class, 'create'])->name('reports.create');
        Route::post('/reports', [ReportController::class, 'store'])->name('reports.store');
        Route::get('/my-reports', [ReportController::class, 'myReports'])->name('reports.my-reports');
        Route::get('/reports/assignments', [ReportController::class, 'assignments'])->name('reports.assignments');
        Route::post('/reports/{report}/resolve-assigned', [ReportController::class, 'resolveAssigned'])->name('reports.resolve-assigned');
        Route::post('/reports/{report}/volunteer', [ReportController::class, 'volunteer'])->name('reports.volunteer');
        Route::get('/reports/{report}', [ReportController::class, 'show'])->name('reports.show');
        Route::get('/reports/{report}/pdf', [ReportController::class, 'downloadPDF'])->name('reports.pdf');
        Route::get('/heatmap', [ReportController::class, 'heatmap'])->name('reports.heatmap');

        // Emergency SOS Alerts
        Route::post('/sos', [SosAlertController::class, 'store'])->name('sos.store');
        Route::get('/sos/active', [SosAlertController::class, 'active'])->name('sos.active');
        Route::get('/sos/my-active', [SosAlertController::class, 'myActive'])->name('sos.my-active');
        Route::post('/sos/{sosAlert}/acknowledge', [SosAlertController::class, 'acknowledge'])->name('sos.acknowledge');
        Route::post('/sos/{sosAlert}/resolve', [SosAlertController::class, 'resolve'])->name('sos.resolve');

        // Admin Only Routes
        Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
            Route::get('/analytics', [AdminController::class, 'analytics'])->name('analytics');
            Route::get('/users', [AdminController::class, 'users'])->name('users');
            Route::post('/users/{user}/approve', [AdminController::class, 'approveUser'])->name('users.approve');
            Route::post('/users/{user}/reject', [AdminController::class, 'rejectUser'])->name('users.reject');
            Route::post('/users/{user}/make-responder', [AdminController::class, 'makeResponder'])->name('users.make-responder');
            Route::post('/users/{user}/remove-responder', [AdminController::class, 'removeResponder'])->name('users.remove-responder');
            
            Route::get('/reports', [AdminController::class, 'reports'])->name('reports');
            Route::post('/reports/{report}/resolve', [AdminController::class, 'resolveReport'])->name('reports.resolve');
            Route::post('/reports/{report}/assign-responder', [AdminController::class, 'assignResponder'])->name('reports.assign-responder');
            Route::delete('/reports/{report}', [AdminController::class, 'deleteReport'])->name('reports.delete');
            
            // Announcements
            Route::resource('announcements', \App\Http\Controllers\AnnouncementController::class)->except(['show', 'edit', 'update']);
            
            // Seed Demo Data
            Route::post('/seed-demo-data', [AdminController::class, 'seedDemoData'])->name('seed-demo');
            Route::post('/clear-demo-data', [AdminController::class, 'clearDemoData'])->name('clear-demo');
            Route::post('/push-demo-incident', [AdminController::class, 'pushDemoIncident'])->name('push-demo-incident');
        });

        // Super Admin Only Routes
        Route::middleware(['super_admin'])->prefix('super-admin')->name('superadmin.')->group(function () {
            Route::get('/dashboard', [\App\Http\Controllers\SuperAdminController::class, 'index'])->name('dashboard');
            Route::post('/users/{user}/approve', [\App\Http\Controllers\SuperAdminController::class, 'approveAdmin'])->name('approve');
            Route::post('/users/{user}/reject', [\App\Http\Controllers\SuperAdminController::class, 'rejectAdmin'])->name('reject');
            Route::delete('/users/{user}', [\App\Http\Controllers\SuperAdminController::class, 'deleteAdmin'])->name('delete');
            Route::post('/reset-sos', [\App\Http\Controllers\SuperAdminController::class, 'resetSosAlerts'])->name('reset-sos');
        });
    });
    Route::post('/ai/chat', [App\Http\Controllers\ChatController::class, 'chat'])->name('ai.chat');
});

require __DIR__.'/auth.php';

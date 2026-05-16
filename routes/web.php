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
    return view('welcome');
});

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    
    // Profile Routes (From Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Approved User Routes
    Route::middleware(['approved'])->group(function () {
        
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Public Announcements for All Users
        Route::get('/announcements', [\App\Http\Controllers\AnnouncementController::class, 'publicIndex'])->name('announcements.list');

        // Incident Reports
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/create', [ReportController::class, 'create'])->name('reports.create');
        Route::post('/reports', [ReportController::class, 'store'])->name('reports.store');
        Route::get('/my-reports', [ReportController::class, 'myReports'])->name('reports.my-reports');
        Route::get('/reports/{report}', [ReportController::class, 'show'])->name('reports.show');

        // Emergency SOS Alerts
        Route::post('/sos', [SosAlertController::class, 'store'])->name('sos.store');
        Route::get('/sos/active', [SosAlertController::class, 'active'])->name('sos.active');
        Route::get('/sos/my-active', [SosAlertController::class, 'myActive'])->name('sos.my-active');
        Route::post('/sos/{sosAlert}/acknowledge', [SosAlertController::class, 'acknowledge'])->name('sos.acknowledge');
        Route::post('/sos/{sosAlert}/resolve', [SosAlertController::class, 'resolve'])->name('sos.resolve');

        // Admin Only Routes
        Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
            Route::get('/users', [AdminController::class, 'users'])->name('users');
            Route::post('/users/{user}/approve', [AdminController::class, 'approveUser'])->name('users.approve');
            Route::post('/users/{user}/reject', [AdminController::class, 'rejectUser'])->name('users.reject');
            
            Route::get('/reports', [AdminController::class, 'reports'])->name('reports');
            Route::post('/reports/{report}/resolve', [AdminController::class, 'resolveReport'])->name('reports.resolve');
            Route::delete('/reports/{report}', [AdminController::class, 'deleteReport'])->name('reports.delete');
            
            // Announcements
            Route::resource('announcements', \App\Http\Controllers\AnnouncementController::class)->except(['show', 'edit', 'update']);
        });
    });
});

require __DIR__.'/auth.php';

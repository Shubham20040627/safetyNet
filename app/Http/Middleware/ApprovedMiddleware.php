<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApprovedMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check() && auth()->user()->status === 'approved') {
            return $next($request);
        }

        if (auth()->check() && auth()->user()->status === 'pending') {
            return \Inertia\Inertia::render('Auth/Pending')->toResponse($request);
        }

        abort(403, 'Your account has been rejected or is not approved.');
    }
}

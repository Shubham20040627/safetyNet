<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): \Inertia\Response
    {
        // Get all admin neighborhoods (excluding Greenwood Valley Safety Corridor)
        $neighborhoods = User::where('role', 'admin')
            ->where('neighborhood_name', '!=', 'Greenwood Valley Safety Corridor')
            ->pluck('neighborhood_name')
            ->unique()
            ->filter()
            ->values();

        return \Inertia\Inertia::render('Auth/Register', compact('neighborhoods'));
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', Rules\Password::defaults()],
            'neighborhood_name' => ['required', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'neighborhood_name' => $request->neighborhood_name,
            'role' => 'user',
            'status' => 'pending', // Requires local Admin approval to gain access!
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(RouteServiceProvider::HOME);
    }

    /**
     * Display the admin registration view.
     */
    public function createAdmin(): \Inertia\Response
    {
        return \Inertia\Inertia::render('Auth/AdminRegister');
    }

    /**
     * Handle an incoming admin registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function storeAdmin(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', Rules\Password::defaults()],
            'neighborhood_name' => ['required', 'string', 'max:255'],
            'neighborhood_lat' => ['required', 'numeric', 'between:-90,90'],
            'neighborhood_lng' => ['required', 'numeric', 'between:-180,180'],
            'neighborhood_boundary' => ['nullable', 'string'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
            'status' => 'pending', // Requires master approval
            'neighborhood_name' => $request->neighborhood_name,
            'neighborhood_lat' => $request->neighborhood_lat,
            'neighborhood_lng' => $request->neighborhood_lng,
            'neighborhood_boundary' => $request->neighborhood_boundary,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(RouteServiceProvider::HOME);
    }
}

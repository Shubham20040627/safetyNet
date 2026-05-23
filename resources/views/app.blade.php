<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

        <!-- Custom styles (including scrollbars) -->
        <style>
            /* Ultra-premium custom thin scrollbar for sidebar */
            .glass-sidebar::-webkit-scrollbar {
                width: 5px;
            }
            .glass-sidebar::-webkit-scrollbar-track {
                background: transparent;
            }
            .glass-sidebar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.15);
                border-radius: 10px;
            }
            .glass-sidebar::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 4px;
            }

            /* Custom scrollbars moved to app.css */
        </style>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        <style>
            /* Force single viewport scrollbar and disable nested scrollbars globally */
            html, :root {
                overflow-y: auto !important;
                overflow-x: clip !important;
                scroll-behavior: smooth !important;
            }
            body, #app, #app > div {
                overflow-y: visible !important;
                overflow-x: clip !important;
                height: auto !important;
            }
        </style>
    </head>
    <body class="font-sans antialiased w-full min-h-screen bg-slate-50 text-gray-900">
        <div id="app" data-page="{{ json_encode($page) }}"></div>
        <script type="application/json" data-page="app">@json($page)</script>
    </body>
</html>

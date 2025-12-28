<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AddNgrokHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Add ngrok-skip-browser-warning header to bypass ngrok warning page
        $request->headers->set('ngrok-skip-browser-warning', 'true');

        $response = $next($request);

        // Also add it to response headers for any redirects
        if ($response instanceof \Illuminate\Http\RedirectResponse) {
            $response->header('ngrok-skip-browser-warning', 'true');
        }

        return $response;
    }
}

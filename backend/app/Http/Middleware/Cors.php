<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    public function handle(Request $request, Closure $next)
    {
        $response = $request->isMethod('OPTIONS')
            ? response('', 200)
            : $next($request);

        $allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'http://192.168.14.230:3000',
            'http://192.168.14.230'

        ];

        $origin = $request->headers->get('Origin');

        if (in_array($origin, $allowedOrigins)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        }

        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->headers->set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, X-Token-Auth, Authorization, X-CSRF-TOKEN, Accept');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Max-Age', '200');

        return $response;
    }
}

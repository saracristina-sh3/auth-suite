<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware para autenticação via cookie HttpOnly
 *
 * Este middleware adiciona o token do cookie auth_token no header Authorization
 * para que o Sanctum possa autenticar a requisição normalmente
 */
class AuthenticateWithCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Se não há Authorization header, tentar pegar do cookie
        if (!$request->bearerToken() && $request->hasCookie('auth_token')) {
            $token = $request->cookie('auth_token');

            // Adicionar token no header Authorization para o Sanctum processar
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }

        return $next($request);
    }
}

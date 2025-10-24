<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LoadAutarquiaFromSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $session = $request->session();
            $sessionKey = $user->getAutarquiaSessionKey();

            // Recuperamos o ID diretamente da sessão para que o contexto em memória
            // seja sempre consistente com o backend (evita leituras do campo na tabela users).
            $autarquiaId = $session->get($sessionKey);
            $user->setAutarquiaContext($autarquiaId, persistSession: false);
        }

        return $next($request);
    }
}

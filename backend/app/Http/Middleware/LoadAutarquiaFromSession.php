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

            // Se a sessão não estiver populada (ex: primeiro request após login), usamos o valor persistido
            if (!$session->has($sessionKey)) {
                $defaultId = $user->getOriginal('autarquia_ativa_id');
                if ($defaultId) {
                    $session->put($sessionKey, $defaultId);
                    $session->save();
                }
            }

            $autarquiaId = $session->get($sessionKey);
            $user->setAutarquiaContext($autarquiaId, persistSession: false);
        }

        return $next($request);
    }
}

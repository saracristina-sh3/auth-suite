<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\AuthService;
use App\Services\UserAutarquiaService;

class AuthServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(AuthService::class, function ($app) {
            return new AuthService(
                $app->make(\App\Services\AutarquiaSessionService::class)
            );
        });

        $this->app->singleton(UserAutarquiaService::class, function ($app) {
            return new UserAutarquiaService(
                $app->make(\App\Services\AutarquiaSessionService::class)
            );
        });
    }
}

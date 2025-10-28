<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Autarquia\AutarquiaService;
use App\Repositories\AutarquiaRepository;

class AutarquiaServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(AutarquiaService::class, function ($app) {
            return new AutarquiaService();
        });

        $this->app->singleton(AutarquiaRepository::class, function ($app) {
            return new AutarquiaRepository();
        });
    }
}

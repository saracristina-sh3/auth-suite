<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\UserAutarquiaManagementService;
use App\Rules\UserAutarquiaValidator;

class UserAutarquiaServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(UserAutarquiaManagementService::class, function ($app) {
            return new UserAutarquiaManagementService();
        });

        $this->app->singleton(UserAutarquiaValidator::class, function ($app) {
            return new UserAutarquiaValidator();
        });
    }
}

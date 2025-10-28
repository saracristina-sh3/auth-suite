<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\PermissionService;
use App\Services\PermissionValidationService;
use App\Repositories\PermissionRepository;

class PermissionServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PermissionValidationService::class, function ($app) {
            return new PermissionValidationService();
        });

        $this->app->singleton(PermissionRepository::class, function ($app) {
            return new PermissionRepository();
        });

        // PermissionService já deve estar registrado, se não, adicione:
        $this->app->singleton(PermissionService::class, function ($app) {
            return new PermissionService();
        });
    }
}

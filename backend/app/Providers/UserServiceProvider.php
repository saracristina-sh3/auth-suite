<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\UserService;
use App\Repositories\UserRepository;

class UserServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(UserService::class, function ($app) {
            return new UserService();
        });

        $this->app->singleton(UserRepository::class, function ($app) {
            return new UserRepository();
        });
    }
}

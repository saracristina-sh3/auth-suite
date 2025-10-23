<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\AutarquiaController;
use App\Http\Controllers\Api\ModulosController;
use App\Http\Controllers\Api\AutarquiaModuloController;
use App\Http\Controllers\Api\UsuarioModuloPermissaoController;
use App\Http\Controllers\Api\SessionAutarquiaController;

Route::get('/', fn() => response()->json(['message' => 'API is running']));

// ====================================
// ROTAS PÚBLICAS
// ====================================
Route::post('/login', [AuthController::class, 'login'])->name('api.login');
Route::post('/register', [AuthController::class, 'register']);

// ====================================
// ROTAS AUTENTICADAS
// ====================================
Route::middleware(['auth:sanctum', 'autarquia.session'])->group(function () {

    // Autenticação
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Suporte: Assumir contexto de autarquia (apenas para superadmin/Sh3)
    Route::post('/support/assume-context', [AuthController::class, 'assumeAutarquiaContext']);
    Route::post('/support/exit-context', [AuthController::class, 'exitAutarquiaContext']);

    // Múltiplas autarquias: Listar e trocar entre autarquias do usuário
    Route::get('/user/autarquias', [AuthController::class, 'getAutarquias']);
    Route::post('/user/switch-autarquia', [AuthController::class, 'switchAutarquia']);

    // ====================================
    // USUÁRIOS
    // ====================================
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/stats', [UserController::class, 'stats']);
        Route::get('/{user}', [UserController::class, 'show']);
        Route::post('/', [UserController::class, 'store']);
        Route::put('/{user}', [UserController::class, 'update']);
        Route::delete('/{user}', [UserController::class, 'destroy']);
        Route::get('/{user}/modulos', [UserController::class, 'modulos']);

        // Gestão de autarquias do usuário (N:N)
        Route::get('/{user}/autarquias', [\App\Http\Controllers\Api\UserAutarquiaController::class, 'index']);
        Route::post('/{user}/autarquias/attach', [\App\Http\Controllers\Api\UserAutarquiaController::class, 'attach']);
        Route::post('/{user}/autarquias/detach', [\App\Http\Controllers\Api\UserAutarquiaController::class, 'detach']);
        Route::post('/{user}/autarquias/sync', [\App\Http\Controllers\Api\UserAutarquiaController::class, 'sync']);
        Route::put('/{user}/active-autarquia', [\App\Http\Controllers\Api\UserAutarquiaController::class, 'updateActive']);
    });

    // ====================================
    // AUTARQUIAS
    // ====================================
    Route::prefix('autarquias')->group(function () {
        Route::get('/', [AutarquiaController::class, 'index']);
        Route::get('/stats', [AutarquiaController::class, 'stats']);
        Route::get('/{autarquia}', [AutarquiaController::class, 'show']);
        Route::post('/', [AutarquiaController::class, 'store']);
        Route::put('/{autarquia}', [AutarquiaController::class, 'update']);
        Route::delete('/{autarquia}', [AutarquiaController::class, 'destroy']);
        Route::get('/{autarquia}/modulos', [AutarquiaController::class, 'modulos']);
        Route::get('/{autarquia}/modulos/stats', [AutarquiaController::class, 'modulosStats']);
        Route::get('/{autarquia}/usuarios', [AutarquiaController::class, 'usuarios']);
    });

    // ====================================
    // MÓDULOS
    // ====================================
    Route::prefix('modulos')->group(function () {
        Route::get('/', [ModulosController::class, 'index']);
        Route::get('/stats', [ModulosController::class, 'stats']);
        Route::get('/{modulo}', [ModulosController::class, 'show']);
        Route::post('/', [ModulosController::class, 'store']);
        Route::put('/{modulo}', [ModulosController::class, 'update']);
        Route::delete('/{modulo}', [ModulosController::class, 'destroy']);
        Route::get('/{modulo}/autarquias', [ModulosController::class, 'autarquias']);
    });

    // ====================================
    // LIBERAÇÃO DE MÓDULOS PARA AUTARQUIAS
    // ====================================
    Route::prefix('autarquia-modulo')->group(function () {
        Route::get('/', [AutarquiaModuloController::class, 'index']);
        Route::put('/bulk', [AutarquiaModuloController::class, 'bulkUpdate']);
        Route::put('/{autarquiaId}/{moduloId}', [AutarquiaModuloController::class, 'update']);
    });

    // ====================================
    // PERMISSÕES DE USUÁRIOS AUTARQUIAS
    // ====================================

    // ====================================
    // PERMISSÕES DE USUÁRIOS NOS MÓDULOS
    // ====================================
    Route::prefix('permissoes')->group(function () {
        Route::get('/', [UsuarioModuloPermissaoController::class, 'index']);
        Route::post('/', [UsuarioModuloPermissaoController::class, 'store']);
        Route::post('/bulk', [UsuarioModuloPermissaoController::class, 'bulkStore']);
        Route::get('/{userId}/{moduloId}/{autarquiaId}', [UsuarioModuloPermissaoController::class, 'show']);
        Route::put('/{userId}/{moduloId}/{autarquiaId}', [UsuarioModuloPermissaoController::class, 'update']);
        Route::delete('/{userId}/{moduloId}/{autarquiaId}', [UsuarioModuloPermissaoController::class, 'destroy']);
        Route::get('/check/{userId}/{moduloId}', [UsuarioModuloPermissaoController::class, 'checkPermission']);
    });

    // ====================================
    // ROLES (mantido para compatibilidade)
    // ====================================
    Route::get('/roles', [RoleController::class, 'index']);

});
    // Sessão de autarquia - mantém contexto isolado por usuário autenticado
    Route::get('/session/autarquia', [SessionAutarquiaController::class, 'show']);
    Route::post('/session/autarquia', [SessionAutarquiaController::class, 'store']);


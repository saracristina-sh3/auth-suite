<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = [
            ['label' => 'Usuário', 'value' => 'user'],
            ['label' => 'Gerente', 'value' => 'manager'],
            ['label' => 'Administrador', 'value' => 'admin'],
            ['label' => 'Superadmin', 'value' => 'superadmin'],
        ];

        $permissions = [
            'user' => ['view_dashboard'],
            'manager' => ['view_dashboard', 'manage_team'],
            'admin' => ['view_dashboard', 'manage_users', 'view_reports'],
            'superadmin' => ['view_dashboard', 'manage_users', 'manage_system', 'view_reports'],
        ];

        return response()->json([
            'success' => true,
            'message' => 'Lista de papéis e permissões recuperada com sucesso.',
            'data' => [
                'roles' => $roles,
                'permissions' => $permissions,
            ],
        ]);
    }
}

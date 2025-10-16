<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        \Log::info('🔐 Tentativa de login', [
            'email' => $request->email,
            'has_password' => !empty($request->password),
            'request_data' => $request->all()
        ]);

        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
    \Log::warning('❌ Login falhou - credenciais incorretas', [
        'email' => $request->email,
        'user_found' => $user !== null
    ]);

    return response()->json([
        'success' => false,
        'message' => 'Credenciais inválidas. Verifique seu email e senha.'
    ], 401);
}

        // Create real Sanctum token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Load autarquia relationship
        $user->load('autarquia');

        \Log::info('✅ Login bem-sucedido', [
            'user_id' => $user->id,
            'email' => $user->email,
            'autarquia_id' => $user->autarquia_id,
            'autarquia_nome' => $user->autarquia?->nome
        ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'cpf' => $user->cpf,
                'role' => $user->role,
                'autarquia_id' => $user->autarquia_id,
                'autarquia' => $user->autarquia ? [
                    'id' => $user->autarquia->id,
                    'nome' => $user->autarquia->nome,
                    'ativo' => $user->autarquia->ativo,
                ] : null,
                'is_active' => $user->is_active,
                'is_superadmin' => $user->is_superadmin,
            ],
            'token' => $token,
            'message' => 'Login successful'
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}

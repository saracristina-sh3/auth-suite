<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'is_superadmin'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_superadmin' => 'boolean',
        ];
    }

    // Métodos de autorização
    public function isAdmin(): bool
    {
        return $this->role === 'admin' || $this->is_superadmin;
    }

    public function isManager(): bool
    {
        return $this->role === 'manager' || $this->isAdmin();
    }

    public function canAccess(string $permission): bool
    {
        // Lógica de permissões específicas
        return $this->is_active && (
            $this->is_superadmin ||
            in_array($permission, $this->getPermissions())
        );
    }

    protected function getPermissions(): array
    {
        // Definir permissões baseadas no role
        $permissions = [
            'user' => ['view_dashboard'],
            'manager' => ['view_dashboard', 'manage_users', 'view_reports'],
            'admin' => ['view_dashboard', 'manage_users', 'manage_system', 'view_reports']
        ];

        return $permissions[$this->role] ?? [];
    }
}

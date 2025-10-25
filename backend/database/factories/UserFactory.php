<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'cpf' => fake()->numerify('###########'), // CPF com 11 dígitos
            'role' => 'user', // Padrão: usuário comum
            'is_active' => true,
            'is_superadmin' => false,
            'autarquia_preferida_id' => null, // Será definido manualmente ou via seeder
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create a superadmin user
     */
    public function superadmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'superadmin',
            'is_superadmin' => true,
        ]);
    }

    /**
     * Create an admin user
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    /**
     * Create a manager/gestor user
     */
    public function manager(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'gestor',
        ]);
    }

    /**
     * Create an inactive user
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Associate user with an autarquia as preferred
     */
    public function withAutarquia(int $autarquiaId): static
    {
        return $this->state(fn (array $attributes) => [
            'autarquia_preferida_id' => $autarquiaId,
        ]);
    }
}

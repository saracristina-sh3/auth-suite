<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Trait para centralizar a lógica de criação e gerenciamento de tokens
 *
 * Este trait fornece métodos para:
 * - Criar access tokens e refresh tokens
 * - Validar tokens
 * - Revogar tokens
 * - Renovar tokens
 */
trait CreatesTokens
{
    /**
     * Tempo de expiração do access token (em minutos)
     */
    protected int $accessTokenExpiresIn = 60; // 1 hora

    /**
     * Tempo de expiração do refresh token (em minutos)
     */
    protected int $refreshTokenExpiresIn = 10080; // 7 dias

    /**
     * Nome do token usado no Sanctum
     */
    protected string $tokenName = 'auth-token';

    /**
     * Cria um novo par de tokens (access + refresh) para o usuário
     *
     * @param User $user
     * @param array $abilities Permissões do token
     * @return array{token: string, refresh_token: string, expires_in: int}
     */
    protected function createTokenPair(User $user, array $abilities = ['*']): array
    {
        // Criar access token com Sanctum
        $accessToken = $user->createToken(
            $this->tokenName,
            $abilities,
            now()->addMinutes($this->accessTokenExpiresIn)
        );

        // Criar refresh token (string aleatória armazenada no banco)
        $refreshToken = $this->createRefreshToken($user);

        return [
            'token' => $accessToken->plainTextToken,
            'refresh_token' => $refreshToken,
            'expires_in' => $this->accessTokenExpiresIn * 60, // Retornar em segundos
        ];
    }

    /**
     * Cria um refresh token para o usuário
     *
     * @param User $user
     * @return string
     */
    protected function createRefreshToken(User $user): string
    {
        // Gerar token aleatório
        $refreshToken = Str::random(64);

        // Armazenar hash do refresh token no banco
        $user->update([
            'refresh_token' => Hash::make($refreshToken),
            'refresh_token_expires_at' => now()->addMinutes($this->refreshTokenExpiresIn),
        ]);

        return $refreshToken;
    }

    /**
     * Valida e renova um refresh token
     *
     * @param User $user
     * @param string $refreshToken
     * @return array{token: string, refresh_token: string, expires_in: int}|null
     * @throws \Exception
     */
    protected function refreshAccessToken(User $user, string $refreshToken): ?array
    {
        // Verificar se o refresh token existe e não expirou
        if (
            !$user->refresh_token ||
            !$user->refresh_token_expires_at ||
            $user->refresh_token_expires_at->isPast()
        ) {
            throw new \Exception('Refresh token expirado ou inválido');
        }

        // Verificar se o refresh token corresponde ao hash armazenado
        if (!Hash::check($refreshToken, $user->refresh_token)) {
            throw new \Exception('Refresh token inválido');
        }

        // Revogar todos os tokens antigos do usuário
        $user->tokens()->delete();

        // Criar novo par de tokens
        return $this->createTokenPair($user);
    }

    /**
     * Revoga todos os tokens do usuário
     *
     * @param User $user
     * @return void
     */
    protected function revokeAllTokens(User $user): void
    {
        // Deletar todos os tokens Sanctum
        $user->tokens()->delete();

        // Limpar refresh token
        $user->update([
            'refresh_token' => null,
            'refresh_token_expires_at' => null,
        ]);
    }

    /**
     * Revoga apenas o token atual (logout da sessão atual)
     *
     * @param User $user
     * @return void
     */
    protected function revokeCurrentToken(User $user): void
    {
        // Deletar apenas o token atual
        $user->currentAccessToken()->delete();
    }

    /**
     * Verifica se o usuário tem um refresh token válido
     *
     * @param User $user
     * @return bool
     */
    protected function hasValidRefreshToken(User $user): bool
    {
        return $user->refresh_token !== null &&
               $user->refresh_token_expires_at !== null &&
               $user->refresh_token_expires_at->isFuture();
    }

    /**
     * Obtém o tempo restante até a expiração do refresh token (em segundos)
     *
     * @param User $user
     * @return int
     */
    protected function getRefreshTokenTimeRemaining(User $user): int
    {
        if (!$user->refresh_token_expires_at) {
            return 0;
        }

        return max(0, now()->diffInSeconds($user->refresh_token_expires_at, false));
    }

    /**
     * Cria um token temporário para suporte/contexto especial
     *
     * @param User $user
     * @param array $abilities
     * @param int $expiresInMinutes
     * @return string
     */
    protected function createTemporaryToken(
        User $user,
        array $abilities = ['*'],
        int $expiresInMinutes = 60
    ): string {
        $token = $user->createToken(
            'temporary-token',
            $abilities,
            now()->addMinutes($expiresInMinutes)
        );

        return $token->plainTextToken;
    }

    /**
     * Configura o tempo de expiração dos tokens
     *
     * @param int $accessTokenMinutes
     * @param int|null $refreshTokenMinutes
     * @return self
     */
    protected function setTokenExpiration(int $accessTokenMinutes, ?int $refreshTokenMinutes = null): self
    {
        $this->accessTokenExpiresIn = $accessTokenMinutes;

        if ($refreshTokenMinutes !== null) {
            $this->refreshTokenExpiresIn = $refreshTokenMinutes;
        }

        return $this;
    }
}

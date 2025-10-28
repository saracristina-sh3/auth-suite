<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\UserService;
use App\Repositories\UserRepository;
use App\Traits\ApiResponses;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    use ApiResponses;

    public function __construct(
        private UserService $userService,
        private UserRepository $userRepository
    ) {}

    public function index(Request $request)
    {
        try {
            $users = $this->userRepository->getUsersPaginated($request->all());

            return $this->successPaginatedResponse(
                $users,
                'Lista de usuários recuperada com sucesso.'
            );
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao recuperar lista de usuários.');
        }
    }

    public function store(Request $request)
    {
        try {
            $user = $this->userService->createUser($request->all());

            return $this->createdResponse($user, 'Usuário criado com sucesso.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao criar usuário.');
        }
    }

    public function update(Request $request, User $user)
    {
        try {
            $updatedUser = $this->userService->updateUser($user, $request->all());

            return $this->updatedResponse($updatedUser, 'Usuário atualizado com sucesso.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao atualizar usuário.');
        }
    }

    public function destroy(User $user)
    {
        try {
            $this->userService->deleteUser($user);

            return $this->deletedResponse('Usuário excluído com sucesso.');
        } catch (\Exception $e) {
            return $this->validationErrorResponse(
                ['user' => [$e->getMessage()]],
                $e->getMessage()
            );
        }
    }

    public function show(User $user)
    {
        try {
            $userWithPermissions = $this->userRepository->getUserWithPermissions($user->id);

            if (!$userWithPermissions) {
                return $this->notFoundResponse('Usuário não encontrado.');
            }

            return $this->successResponse($userWithPermissions, 'Usuário recuperado com sucesso.');
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao recuperar usuário.');
        }
    }

    public function modulos(User $user)
    {
        try {
            $modulos = $user->getModulosDisponiveis();

            return $this->successResponse($modulos, 'Módulos do usuário recuperados com sucesso.');
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao recuperar módulos do usuário.');
        }
    }

    public function stats()
    {
        try {
            $stats = $this->userRepository->getUserStats();

            return $this->successResponse($stats, 'Estatísticas de usuários recuperadas com sucesso.');
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao recuperar estatísticas.');
        }
    }
}

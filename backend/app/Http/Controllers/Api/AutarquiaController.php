<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Autarquia;
use Illuminate\Http\Request;
use App\Services\Autarquia\AutarquiaService;
use App\Repositories\AutarquiaRepository;
use App\Traits\ApiResponses;
use Illuminate\Validation\ValidationException;

class AutarquiaController extends Controller
{
    use ApiResponses;

    public function __construct(
        private AutarquiaService $autarquiaService,
        private AutarquiaRepository $autarquiaRepository
    ) {}

    /**
     * Lista todas as autarquias (com paginação)
     */
    public function index(Request $request)
    {
        try {
            $autarquias = $this->autarquiaRepository->getAutarquiasPaginated($request->all());

            return $this->successPaginatedResponse(
                $autarquias,
                'Lista de autarquias recuperada com sucesso.'
            );
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao recuperar lista de autarquias.');
        }
    }

    /**
     * Exibe uma autarquia específica
     */
    public function show(Autarquia $autarquia)
    {
        try {
            $autarquiaWithRelations = $this->autarquiaRepository->getAutarquiaWithRelations($autarquia->id);

            if (!$autarquiaWithRelations) {
                return $this->notFoundResponse('Autarquia não encontrada.');
            }

            return $this->successResponse(
                $autarquiaWithRelations,
                'Autarquia recuperada com sucesso.'
            );
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao recuperar autarquia.');
        }
    }

    /**
     * Cria uma nova autarquia
     */
    public function store(Request $request)
    {
        try {
            $autarquia = $this->autarquiaService->createAutarquia($request->all());

            return $this->createdResponse(
                $autarquia,
                'Autarquia criada com sucesso.'
            );
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao criar autarquia.');
        }
    }

    /**
     * Atualiza uma autarquia existente
     */
    public function update(Request $request, Autarquia $autarquia)
    {
        try {
            $updatedAutarquia = $this->autarquiaService->updateAutarquia($autarquia, $request->all());

            return $this->updatedResponse(
                $updatedAutarquia,
                'Autarquia atualizada com sucesso.'
            );
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao atualizar autarquia.');
        }
    }

    /**
     * Remove uma autarquia
     */
    public function destroy(Autarquia $autarquia)
    {
        try {
            $this->autarquiaService->deleteAutarquia($autarquia);

            return $this->deletedResponse('Autarquia excluída com sucesso.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Lista os módulos da autarquia
     */
    public function modulos(Autarquia $autarquia)
    {
        try {
            $modulos = $this->autarquiaRepository->getModulosByAutarquia($autarquia->id);

            return $this->successResponse(
                $modulos,
                'Módulos da autarquia recuperados com sucesso.'
            );
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao recuperar módulos da autarquia.');
        }
    }

    /**
     * Retorna estatísticas dos módulos da autarquia
     */
    public function modulosStats(Autarquia $autarquia)
    {
        try {
            $stats = $this->autarquiaService->getModuleStats($autarquia);

            return $this->successResponse(
                $stats,
                'Estatísticas dos módulos da autarquia recuperadas com sucesso.'
            );
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao recuperar estatísticas dos módulos.');
        }
    }

    /**
     * Lista os usuários da autarquia
     */
    public function usuarios(Autarquia $autarquia)
    {
        try {
            $usuarios = $this->autarquiaRepository->getUsuariosByAutarquia($autarquia->id);

            return $this->successResponse(
                $usuarios,
                'Usuários da autarquia recuperados com sucesso.'
            );
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao recuperar usuários da autarquia.');
        }
    }

    /**
     * Retorna estatísticas das autarquias
     */
    public function stats()
    {
        try {
            $stats = $this->autarquiaService->getGlobalStats();

            return $this->successResponse(
                $stats,
                'Estatísticas de autarquias recuperadas com sucesso.'
            );
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao recuperar estatísticas.');
        }
    }
}

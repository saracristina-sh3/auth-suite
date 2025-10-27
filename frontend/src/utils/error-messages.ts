import { ErrorType, HttpErrorCode, type ProcessedError } from '@/types/common/error.types'

/**
 * Dicionário de mensagens de erro amigáveis com instruções
 */
export const ERROR_MESSAGES: Record<ErrorType, ProcessedError> = {
  [ErrorType.NETWORK]: {
    severity: 'error',
    title: 'Erro de Conexão',
    message: 'Não foi possível conectar ao servidor.',
    instruction: 'Verifique sua conexão com a internet e tente novamente.'
  },
  [ErrorType.VALIDATION]: {
    severity: 'validation',
    title: 'Dados Inválidos',
    message: 'Alguns campos precisam ser corrigidos.',
    instruction: 'Revise os campos destacados e corrija os erros antes de continuar.'
  },
  [ErrorType.AUTHENTICATION]: {
    severity: 'error',
    title: 'Autenticação Necessária',
    message: 'Sua sessão expirou ou você não está autenticado.',
    instruction: 'Faça login novamente para continuar.'
  },
  [ErrorType.AUTHORIZATION]: {
    severity: 'warning',
    title: 'Acesso Negado',
    message: 'Você não tem permissão para realizar esta ação.',
    instruction: 'Entre em contato com o administrador do sistema se precisar de acesso.'
  },
  [ErrorType.NOT_FOUND]: {
    severity: 'warning',
    title: 'Não Encontrado',
    message: 'O recurso solicitado não foi encontrado.',
    instruction: 'Verifique se o item ainda existe ou tente recarregar a página.'
  },
  [ErrorType.CONFLICT]: {
    severity: 'warning',
    title: 'Conflito de Dados',
    message: 'Já existe um registro com essas informações.',
    instruction: 'Verifique os dados informados ou edite o registro existente.'
  },
  [ErrorType.SERVER]: {
    severity: 'error',
    title: 'Erro no Servidor',
    message: 'Ocorreu um erro interno no servidor.',
    instruction: 'Tente novamente em alguns instantes. Se o problema persistir, contate o suporte.'
  },
  [ErrorType.TIMEOUT]: {
    severity: 'warning',
    title: 'Tempo Esgotado',
    message: 'A requisição demorou muito tempo para ser processada.',
    instruction: 'Verifique sua conexão e tente novamente.'
  },
  [ErrorType.UNKNOWN]: {
    severity: 'error',
    title: 'Erro Inesperado',
    message: 'Ocorreu um erro inesperado.',
    instruction: 'Tente novamente ou entre em contato com o suporte técnico.'
  }
}

/**
 * Mapeamento de códigos HTTP para tipos de erro
 */
export const HTTP_ERROR_MAP: Record<number, ErrorType> = {
  [HttpErrorCode.BAD_REQUEST]: ErrorType.VALIDATION,
  [HttpErrorCode.UNAUTHORIZED]: ErrorType.AUTHENTICATION,
  [HttpErrorCode.FORBIDDEN]: ErrorType.AUTHORIZATION,
  [HttpErrorCode.NOT_FOUND]: ErrorType.NOT_FOUND,
  [HttpErrorCode.CONFLICT]: ErrorType.CONFLICT,
  [HttpErrorCode.UNPROCESSABLE_ENTITY]: ErrorType.VALIDATION,
  [HttpErrorCode.TOO_MANY_REQUESTS]: ErrorType.TIMEOUT,
  [HttpErrorCode.INTERNAL_SERVER_ERROR]: ErrorType.SERVER,
  [HttpErrorCode.BAD_GATEWAY]: ErrorType.SERVER,
  [HttpErrorCode.SERVICE_UNAVAILABLE]: ErrorType.SERVER,
  [HttpErrorCode.GATEWAY_TIMEOUT]: ErrorType.TIMEOUT
}

/**
 * Mensagens específicas para contextos de negócio
 */
export const BUSINESS_ERROR_MESSAGES: Record<string, ProcessedError> = {
  'user.duplicate.email': {
    severity: 'validation',
    title: 'E-mail Duplicado',
    message: 'Já existe um usuário cadastrado com este e-mail.',
    instruction: 'Use um e-mail diferente ou edite o usuário existente.'
  },
  'user.duplicate.cpf': {
    severity: 'validation',
    title: 'CPF Duplicado',
    message: 'Já existe um usuário cadastrado com este CPF.',
    instruction: 'Verifique o CPF informado ou edite o usuário existente.'
  },
  'user.invalid.cpf': {
    severity: 'validation',
    title: 'CPF Inválido',
    message: 'O CPF informado não é válido.',
    instruction: 'Digite um CPF válido no formato: 000.000.000-00'
  },
  'user.weak.password': {
    severity: 'validation',
    title: 'Senha Fraca',
    message: 'A senha não atende aos requisitos mínimos de segurança.',
    instruction: 'Use no mínimo 8 caracteres, incluindo letras, números e caracteres especiais.'
  },
  'user.not.found': {
    severity: 'warning',
    title: 'Usuário Não Encontrado',
    message: 'O usuário solicitado não existe ou foi removido.',
    instruction: 'Verifique a lista de usuários atualizada.'
  },

  'autarquia.duplicate.nome': {
    severity: 'validation',
    title: 'Nome Duplicado',
    message: 'Já existe uma autarquia com este nome.',
    instruction: 'Escolha um nome diferente para a autarquia.'
  },
  'autarquia.has.users': {
    severity: 'warning',
    title: 'Autarquia em Uso',
    message: 'Esta autarquia possui usuários vinculados.',
    instruction: 'Remova ou transfira os usuários antes de excluir a autarquia.'
  },
  'autarquia.not.found': {
    severity: 'warning',
    title: 'Autarquia Não Encontrada',
    message: 'A autarquia solicitada não existe ou foi removida.',
    instruction: 'Verifique a lista de autarquias atualizada.'
  },

  'modulo.duplicate.nome': {
    severity: 'validation',
    title: 'Módulo Duplicado',
    message: 'Já existe um módulo com este nome.',
    instruction: 'Escolha um nome diferente para o módulo.'
  },
  'modulo.in.use': {
    severity: 'warning',
    title: 'Módulo em Uso',
    message: 'Este módulo está sendo usado por autarquias ou usuários.',
    instruction: 'Desative o módulo ao invés de removê-lo para manter o histórico.'
  },

  'permission.denied': {
    severity: 'warning',
    title: 'Permissão Negada',
    message: 'Você não tem permissão para acessar este recurso.',
    instruction: 'Solicite as permissões necessárias ao administrador do sistema.'
  },

  'session.expired': {
    severity: 'warning',
    title: 'Sessão Expirada',
    message: 'Sua sessão expirou por inatividade.',
    instruction: 'Faça login novamente para continuar usando o sistema.'
  },

  'network.offline': {
    severity: 'error',
    title: 'Sem Conexão',
    message: 'Você está sem conexão com a internet.',
    instruction: 'Verifique sua conexão de rede e tente novamente.'
  },
  'network.timeout': {
    severity: 'warning',
    title: 'Conexão Lenta',
    message: 'A conexão está muito lenta.',
    instruction: 'Aguarde alguns instantes e tente novamente.'
  }
}

/**
 * Mensagens de validação de campos
 */
export const VALIDATION_MESSAGES: Record<string, string> = {
  'required': 'Este campo é obrigatório.',
  'email': 'Digite um e-mail válido.',
  'cpf': 'Digite um CPF válido (000.000.000-00).',
  'min.length': 'O valor é muito curto.',
  'max.length': 'O valor é muito longo.',
  'password.mismatch': 'As senhas não coincidem.',
  'invalid.format': 'Formato inválido.',
  'invalid.date': 'Data inválida.',
  'min.value': 'Valor abaixo do mínimo permitido.',
  'max.value': 'Valor acima do máximo permitido.'
}

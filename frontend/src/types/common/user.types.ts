import type { Autarquia } from "@/types/support/autarquia.types";

export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  role: string;

  // ✅ Preferência do usuário (salva no BD)
  autarquia_preferida_id?: number | null;
  autarquia_preferida?: Autarquia | null;

  // ✅ Da session (pode estar ausente no login inicial)
  // Esses campos vêm da API mas não são persistidos no localStorage
  autarquia_ativa_id?: number | null;
  autarquia_ativa?: Autarquia | null;

  // Deprecated - compatibilidade
  autarquia?: Autarquia;

  is_active: boolean;
  is_superadmin: boolean;

  // Propriedades adicionadas quando em modo suporte
  _support_mode?: boolean;

  pivot?: {
    role: string
    is_admin: boolean
    ativo: boolean
    is_default: boolean
    data_vinculo: string
  }

}

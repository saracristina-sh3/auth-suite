import type { Autarquia } from "@/types/support/autarquia.types";

export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  role: string;

  autarquia_preferida_id?: number | null;
  autarquia_preferida?: Autarquia | null;

  autarquia_ativa_id?: number | null;
  autarquia_ativa?: Autarquia | null;

  // Deprecated - compatibilidade
  autarquia?: Autarquia;

  is_active: boolean;
  is_superadmin: boolean;

  _support_mode?: boolean;

  pivot?: {
    role: string
    is_admin: boolean
    ativo: boolean
    is_default: boolean
    data_vinculo: string
  }

    autarquias?: number[] | Autarquia[];
  password?: string;

}

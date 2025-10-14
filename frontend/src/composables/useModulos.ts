// src/composables/useModulos.ts

import AlmoxarifadoIcon from '@/components/icons/IconAlmoxarifado.vue'
import ComprasIcon from '@/components/icons/IconCompras.vue'
import ContabilidadeIcon from '@/components/icons/IconContabilidade.vue'
import ControleInternoIcon from '@/components/icons/IconControleInterno.vue'
import DepartamentoPessoalIcon from '@/components/icons/IconDepartamentoPessoal.vue'
import DiariasIcon from '@/components/icons/IconDiarias.vue'
import FrotaIcon from '@/components/icons/IconFrota.vue'
import OrcamentoIcon from '@/components/icons/IconOrcamento.vue'
import PatrimonioIcon from '@/components/icons/IconPatrimonio.vue'
import RequisicaoInternaIcon from '@/components/icons/IconRequisicaoInterna.vue'
import TesourariaIcon from '@/components/icons/IconTesouraria.vue'

// Lista centralizada de módulos
const modulos = [
  {
    key: 'frota',
    title: 'Frota',
    description: 'Gerencie sua frota de veículos',
    icon: FrotaIcon,
    route: '/frota'
  },
  {
    key: 'compras',
    title: 'Compras',
    description: 'Sistema de compras e licitações',
    icon: ComprasIcon,
    route: '/compras'
  },
  {
    key: 'almoxarifado',
    title: 'Almoxarifado',
    description: 'Controle de estoque e materiais',
    icon: AlmoxarifadoIcon,
    route: '/almoxarifado'
  },
  {
    key: 'contabilidade',
    title: 'Contabilidade',
    description: 'Gestão contábil e fiscal',
    icon: ContabilidadeIcon,
    route: '/contabilidade'
  },
  {
    key: 'dp',
    title: 'Departamento Pessoal',
    description: 'Gestão de recursos humanos',
    icon: DepartamentoPessoalIcon,
    route: '/departamento-pessoal'
  },
  {
    key: 'controle-interno',
    title: 'Controle Interno',
    description: 'Auditoria dos processos internos',
    icon: ControleInternoIcon,
    route: '/controle-interno'
  },
  {
    key: 'tesouraria',
    title: 'Tesouraria',
    description: 'Controle de caixa',
    icon: TesourariaIcon,
    route: '/tesouraria'
  },
  {
    key: 'orcamento',
    title: 'Orçamento',
    description: 'Planejamento orçamentário anual',
    icon: OrcamentoIcon,
    route: '/orcamento'
  },
  {
    key: 'patrimonio',
    title: 'Patrimônio',
    description: 'Gestão de bens e inventário patrimonial',
    icon: PatrimonioIcon,
    route: '/patrimonio'
  },
  {
    key: 'diarias',
    title: 'Diárias',
    description: 'Controle de diárias e viagens',
    icon: DiariasIcon,
    route: '/diarias'
  },
  {
    key: 'requisicao-interna',
    title: 'Requisição Interna',
    description: 'Controle de requisições',
    icon: RequisicaoInternaIcon,
    route: '/requisicao-interna'
  }
]

export function useModulos() {
  return { modulos }
}

export default modulos

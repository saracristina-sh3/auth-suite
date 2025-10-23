// src/constants/modulos.constants.ts
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

// Mapa de ícones - mapeia nomes de ícones para componentes Vue
export const iconMap: Record<string, any> = {
  // Nomes dos ícones do seeder (backend)
  'frota_button': FrotaIcon,
  'compras_button': ComprasIcon,
  'almoxarifado_button': AlmoxarifadoIcon,
  'contabilidade_button': ContabilidadeIcon,
  'departamento_pessoal_button': DepartamentoPessoalIcon,
  'controle_interno_button': ControleInternoIcon,
  'tesouraria_button': TesourariaIcon,
  'orcamento_button': OrcamentoIcon,
  'patrimonio_button': PatrimonioIcon,
  'diarias_button': DiariasIcon,
  'requisicao_interna_button': RequisicaoInternaIcon,

  // Mantém nomes antigos para compatibilidade (caso existam dados legados)
  'FrotaIcon': FrotaIcon,
  'ComprasIcon': ComprasIcon,
  'AlmoxarifadoIcon': AlmoxarifadoIcon,
  'ContabilidadeIcon': ContabilidadeIcon,
  'DepartamentoPessoalIcon': DepartamentoPessoalIcon,
  'ControleInternoIcon': ControleInternoIcon,
  'TesourariaIcon': TesourariaIcon,
  'OrcamentoIcon': OrcamentoIcon,
  'PatrimonioIcon': PatrimonioIcon,
  'DiariasIcon': DiariasIcon,
  'RequisicaoInternaIcon': RequisicaoInternaIcon,

  // Também suporta ícones do PrimeIcons
  'pi-home': 'pi pi-home',
  'pi-box': 'pi pi-box',
  'pi-users': 'pi pi-users',
  'pi-car': 'pi pi-car'
}

// Mapa de rotas - mapeia nomes de módulos para rotas Vue Router
export const routeMap: Record<string, string> = {
  'Frota': '/frota',
  'Compras': '/compras',
  'Almoxarifado': '/almoxarifado',
  'Contabilidade': '/contabilidade',
  'Departamento Pessoal': '/departamento-pessoal',
  'Controle Interno': '/controle-interno',
  'Tesouraria': '/tesouraria',
  'Orçamento': '/orcamento',
  'Patrimônio': '/patrimonio',
  'Diárias': '/diarias',
  'Requisição Interna': '/requisicao-interna'
}
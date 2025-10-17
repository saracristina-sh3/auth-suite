// src/composables/useModulos.ts
import { ref, onMounted } from 'vue'
import { moduloService } from '@/services/modulos.service'
import { authService } from '@/services/auth.service'
import type { Modulo } from '@/types/auth'

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
// Os nomes devem corresponder ao campo 'icone' retornado pelo backend
const iconMap: Record<string, any> = {
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
const routeMap: Record<string, string> = {
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

interface ModuloWithUI extends Modulo {
  icon?: any
  route?: string
}

const modulos = ref<ModuloWithUI[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

export function useModulos() {
  const loadModulos = async () => {
    try {
      loading.value = true
      error.value = null

      // Pega o usuário atual
      const user = authService.getUserFromStorage()

      if (!user) {
        error.value = 'Usuário não autenticado'
        modulos.value = []
        return
      }

      // Carregar módulos baseado na autarquia do usuário (real ou temporária em modo suporte)
      let data
      if (user.autarquia_id) {
        // Usuário com autarquia associada vê módulos da sua autarquia
        console.log('👤 Carregando módulos da autarquia:', user.autarquia?.nome)
        data = await moduloService.list(user.autarquia_id)
      } else {
        error.value = 'Usuário não possui autarquia associada'
        modulos.value = []
        return
      }

      // Mapeia os módulos com ícones e rotas
      modulos.value = data
        .filter(modulo => modulo.ativo) // Apenas módulos ativos
        .map(modulo => ({
          ...modulo,
          // Mapeia o ícone (componente Vue ou classe PrimeIcons)
          icon: iconMap[modulo.icone || ''] || iconMap[modulo.nome] || 'pi pi-box',
          // Mapeia a rota baseada no nome do módulo
          route: routeMap[modulo.nome] || '/',
          // Mantém campos legados para compatibilidade
          key: modulo.nome.toLowerCase().replace(/\s+/g, '-'),
          title: modulo.nome,
          description: modulo.descricao || `Módulo ${modulo.nome}`
        }))

      console.log('✅ Módulos carregados para autarquia:', user.autarquia?.nome, modulos.value)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar módulos'
      console.error('❌ Erro ao carregar módulos:', err)
      modulos.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadModulos()
  })

  return {
    modulos,
    loading,
    error,
    reload: loadModulos
  }
}
import type { Ref } from 'vue'
import type { FieldConfig } from '@/types/common/table.types'


export interface TabConfig {
  label: string
  path: string
  allowsNew?: boolean
  singularLabel?: string
}

export interface UseSupportTabsOptions {
  userFields: Ref<FieldConfig[]>
  autarquiaFields: FieldConfig[]
  moduloFields: FieldConfig[]
  onTabChange?: (tabName: string) => void | Promise<void>
}

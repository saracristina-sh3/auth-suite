
export interface ActionConfig {
  name: string
  icon: string
  event: string
  tooltip?: string
  class?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'text'
}
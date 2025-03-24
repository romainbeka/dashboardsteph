import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'Abonné' | 'Désabonner' | 'Suspendu'
export type ReductionStatus = "Active" | "Terminer" | "Bientôt Expirées" | "Prochainement" | "";
export type SaleStatus = 'Payer' | 'Erreur' | 'Rembourser'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface Reduction {
  id: number
  code: string
  pourcentage: number
  utiliser: number
  maxUsage?: number | null
  start: string
  end: string
  status: ReductionStatus
  isActive: boolean
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'Membre' | 'owner'
  avatar: Avatar
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

export interface JDR {
  id: number
  name: string
  description?: string
  price?: number
  discount?: string
  systems?: string[]
  compatibleSystems?: string[]
  compatibleSystemsecondaire?: string[]
  associatedProducts?: string[]
  pages?: number
  theme?: 'Contemporain' | 'Horreur' | 'Fantastique' | 'Sci-fi'
  language?: string
  avatar: {
    src: string
  }
}
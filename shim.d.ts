import type { ProtocolWithReturn } from 'webext-bridge'
import type { MSCItem } from '~/msc/MSCItem'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    'tab-prev': { title: string | undefined }
    'get-current-tab': ProtocolWithReturn<{ tabId: number }, { title?: string }>
    'EXECUTE-MSC': ProtocolWithReturn<
      { urls: string[], mcmasterItemJSON: string, DEBUG: boolean, settingsJSON: string },
      { windowResults?: (Partial<MSCItem>[] | MSCItem[] | Error)[], error?: Error }
    >
  }
}

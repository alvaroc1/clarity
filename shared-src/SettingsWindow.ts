import { createManagedWindow, ManagedWindow } from '../main-src/util/createManagedWindow'

export interface SettingsProps {
  port: number
  error: string | null
}

export interface SettingsEvent {
  port: number
}

export function createSettingsWindow(
  settings: SettingsProps, 
  onPortChange: (port: number) => void
): Promise<ManagedWindow<SettingsProps>> {
  return createManagedWindow<SettingsProps, SettingsEvent>({
    id: 'settings',
    filePath: 'build/settings.html',
    title: 'Settings',
    width: 280,
    height: 180,
    initialProps: settings,
    hideOnBlur: true,
    onEvent: (ev) => {
      onPortChange(ev.port)
    }
  })
}

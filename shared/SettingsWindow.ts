import { ManagedWindow } from "../main-src/util/ManagedWindow"

export interface SettingsProps {
  port: number
  error: string | null
}

export interface SettingsEvent {
  port: number
}

export class SettingsWindow {
  static create(settings: SettingsProps, onPortChange: (port: number) => void) {
    return ManagedWindow.create<SettingsProps, SettingsEvent>({
      id: 'settings',
      filePath: "build/settings.html",
      title: "Settings",
      width: 280,
      height: 180,
      initialProps: settings,
      hideOnBlur: true,
      onEvent: (ev) => {
        onPortChange(ev.port)
      }
    })
  }
}

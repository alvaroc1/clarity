import { Menu } from 'electron'
import { Status } from './Status'
import path from 'path'

export function buildContextMenu(status: Status, port: number, onSettingsClick: () => void): Electron.Menu {
  const [onoff, label] = (() => {
    switch (status) {
      case Status.starting: return [false, `Starting: Port ${port}`]
      case Status.running: return [true, `Running: Port ${port}`]
      case Status.stopping: return [true, 'Stopping']
      case Status.stopped: return [false, 'Stopped']
    }
  })()
  return Menu.buildFromTemplate([
    { label: label, icon: path.join(__dirname, onoff ? 'on@2x.png' : 'off@2x.png') },
    { type: 'separator' },
    { label: 'Settings...', click: onSettingsClick, icon: path.join(__dirname, 'settingsTemplate@2x.png') },
    { label: 'About Clarity', role: 'about', icon: path.join(__dirname, 'clarityTemplate@2x.png') },
    { type: 'separator' },
    { label: 'Quit Clarity', role: 'quit' }
  ])
}
import { BrowserWindow, ipcMain } from "electron"

interface ManagedWindowSettings<Props, Ev> {
  id: string
  filePath: string
  title: string
  initialProps: Props
  width: number
  height: number
  onEvent?: (ev: Ev) => void
  onBlur?: () => void
  onHide?: () => void
  hideOnBlur?: boolean
}

export class ManagedWindow<Props, Ev> {
  #window: BrowserWindow

  protected constructor(window: BrowserWindow) {
    this.#window = window
  }

  show() {
    this.#window.show()
  }

  hide() {
    this.#window.hide()
  }

  close() {
    this.#window.destroy()
  }

  update(props: Partial<Props>) {
    this.#window.webContents.send('update', props)
  }

  static async create<Props, Ev>(
    settings: ManagedWindowSettings<Props, Ev>
  ): Promise<ManagedWindow<Props, Ev>> {
    const win = new BrowserWindow({
      title: settings.title,
      show: false,
      //resizable: false,
      resizable: true,
      fullscreenable: false,
      minimizable: false,
      maximizable: false,
      width: settings.width,
      height: settings.height,
      //alwaysOnTop: true,
      //movable: false,
      frame: true,
      skipTaskbar: true,
      //vibrancy: 'light'
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    })

    // never close, only hide
    win.on('close', (ev) => {
      ev.preventDefault()
      win.hide()
    })

    settings.onBlur && win.on('blur', () => {
      settings.onBlur!()
    })
    settings.onHide && win.on('hide', () => {
      settings.onHide!()
    })
    settings.hideOnBlur && win.on('blur', () => {
      win.hide()
    })

    settings.onEvent && ipcMain.on(`window.${settings.id}`, (_, data) => {
      settings.onEvent!(data)
    })

    ipcMain.on(`window.${settings.id}.close`, () => {
      win.hide()
    })

    return new Promise((resolve) => {
      win.loadFile(settings.filePath).then((_) => {
        win.webContents.send('update', settings.initialProps)

        resolve(
          new ManagedWindow<Props, Ev>(win)
        )
      })
    })
  }
}

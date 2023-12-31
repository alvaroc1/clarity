import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'

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

export type ManagedWindow<Props> = Readonly<{
  show (): void,
  hide (): void,
  close (): void,
  update(props: Partial<Props>): void,
}>

export function createManagedWindow<Props, Ev>({ 
  id, 
  title,
  filePath,
  width,
  height,
  initialProps,
  onBlur, 
  onHide, 
  onEvent, 
  hideOnBlur = false
}: ManagedWindowSettings<Props, Ev>): Promise<ManagedWindow<Props>> {
  const win = new BrowserWindow({
    title,
    show: false,
    //resizable: false,
    resizable: true,
    fullscreenable: false,
    minimizable: false,
    maximizable: false,
    width,
    height,
    //alwaysOnTop: true,
    //movable: false,
    frame: true,
    skipTaskbar: true,
    //vibrancy: 'light'
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
  })

  // never close, only hide
  win.on('close', (ev) => {
    ev.preventDefault()
    win.hide()
  })

  if (onBlur) {
    win.on('blur', () => {
      onBlur()
    })
  }

  if (onHide) {
    win.on('hide', () => {
      onHide()
    })
  }

  if (hideOnBlur) {
    win.on('blur', () => {
      win.hide()
    })
  }

  if (onEvent) {
    ipcMain.on(`window.${id}`, (_, data: Ev) => {
      onEvent(data)
    })
  }

  ipcMain.on(`window.${id}.close`, () => {
    win.hide()
  })

  return new Promise((resolve) => {
    win.loadFile(filePath).then(() => {
      win.webContents.send('update', initialProps)

      resolve({
        show() {
          win.show()
        },
    
        hide() {
          win.hide()
        },
    
        close() {
          win.destroy()
        },
    
        update(props: Partial<Props>) {
          win.webContents.send('update', props)
        },
      })
    })
  })
}

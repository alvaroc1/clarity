import * as React from 'react'
// import Renderer from 'electron/renderer'
import * as ReactDOM from 'react-dom/client'
import { CssVarsProvider } from '@mui/joy/styles'

interface Extra<Ev> {
  onEvent: (ev: Ev) => void
  close: () => void
}

export class ManagedWindowComponent<P, S, Ev> extends React.Component<P & Extra<Ev>, S> {
  static async attach<P extends object, Ev>(id: string, element: Element, Component: React.ComponentType<P & Extra<Ev>>): Promise<void> {

    const handleOnEvent = (ev: Ev) => {
      clarity.emitEvent(id, ev)
    }
    const handleClose = () => {
      clarity.closeWindow(id)
    }

    let lastProps = {}

    // Renderer.ipcRenderer.on('update', (_, props: P) => {
    clarity.onUpdate((props: P) => {
      const newProps = { ...lastProps, ...props }
      lastProps = newProps
      ReactDOM.createRoot(element).render(
        <React.StrictMode>
          <CssVarsProvider>
            <Component onEvent={handleOnEvent} close={handleClose} {...newProps} />
          </CssVarsProvider>
        </React.StrictMode>
      )
    })
  }
}

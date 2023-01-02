import { Display } from './display/Display'
import { ServerInstruction } from '../guacamole/ServerInstruction'
import { ClientInstruction } from '../guacamole/ClientInstruction'
import Renderer from 'electron/renderer'

const ipcRenderer = Renderer.ipcRenderer

const display = new Display(
  mouseEv => {
    ipcRenderer.send(
      'event',
      ClientInstruction.mouse(mouseEv.x, mouseEv.y, mouseEv.buttons)
    )
  }
)
const appDiv = document.getElementById('app')!!
display.mount(appDiv)

/*
appDiv.addEventListener('click', ev => {
  const rect = (ev.target as Element).getBoundingClientRect();
  const x = ev.clientX - rect.left; //x position within the element.
  const y = ev.clientY - rect.top;
  ipcRenderer.send('event', ClientCommand.click(x, y))
})
appDiv.addEventListener('mousemove', ev => {
  const rect = (ev.target as Element).getBoundingClientRect();
  const x = ev.clientX - rect.left; //x position within the element.
  const y = ev.clientY - rect.top;
  ipcRenderer.send('event', ClientCommand.mousemove(x, y))
})
*/


/*
document.addEventListener('keyup', ev => {
  ipcRenderer.send('event', ClientCommand.)
})
*/

ipcRenderer.on('commands', (event: any, commands: ServerInstruction[]) => {
  commands.forEach(cmd => {
    // flush the display (run task on animation frame) on sync
    if (cmd[0] == 'sync') {
      display.flush(() => {
        ipcRenderer.send(
          'event',
          ClientInstruction.sync(cmd[1])
        )
      })
    } else {
      display.exec(cmd)
    }
  })
})

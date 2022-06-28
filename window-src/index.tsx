import { Display } from './display/Display'
import { ClientCommand, Command } from '../protocol/Command'

/* 
// Something like this should work, but it doesn't
// something to do with commonjs vs modules
import { Renderer } from 'electron'
const ipcRenderer = Renderer.ipcRenderer
*/
const { ipcRenderer } = require('electron')

const display = new Display(
  mouseEv => {
    ipcRenderer.send(
      'event',
      ClientCommand.mouse(mouseEv.x, mouseEv.y, mouseEv.buttons)
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

ipcRenderer.on('commands', (event: any, commands: Command[]) => {
  commands.forEach(cmd => {
    // flush the display (run task on animation frame) on sync
    if (cmd[0] == 'sync') {
      display.flush()
    } else {
      display.exec(cmd)
    }
  })
})

import { Display } from './display/Display'
import { ClientInstruction } from '../guacamole/ClientInstruction'

const display = new Display(
  mouseEv => {
    clarity.send(
      ClientInstruction.mouse(mouseEv.x, mouseEv.y, mouseEv.buttons)
    )
  }
)
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const appDiv = document.getElementById('app')!
display.mount(appDiv)

appDiv.addEventListener('click', ev => {
  const rect = (ev.target as Element).getBoundingClientRect()
  const x = ev.clientX - rect.left //x position within the element.
  const y = ev.clientY - rect.top
  clarity.send(ClientInstruction.click(x, y))
})
appDiv.addEventListener('mousemove', ev => {
  const rect = (ev.target as Element).getBoundingClientRect()
  const x = ev.clientX - rect.left //x position within the element.
  const y = ev.clientY - rect.top
  clarity.send(ClientInstruction.mousemove(x, y))
})

clarity.onCommands((ev, commands) => {
  commands.forEach(cmd => {
    // flush the display (run task on animation frame) on sync
    if (cmd[0] == 'sync') {
      display.flush(() => {
        clarity.send(
          ClientInstruction.sync(cmd[1])
        )
      })
    } else {
      display.exec(cmd)
    }
  })
})

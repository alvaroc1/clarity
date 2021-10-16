import React from 'react'
import ReactDOM from 'react-dom'
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/core/MenuItem'
import Typography from '@material-ui/core/Typography'
import { Display } from './display/Display'
import { Command } from '../protocol/Command'
import { ChannelMask } from '../protocol/ChannelMask'
//import { ipcRenderer } from 'electron'
const { ipcRenderer } = require('electron')

/*
function App() {
  return (
    <div>
      <AppBar position='static'>
      <IconButton edge="start" color="inherit" aria-label="menu">
        <MenuIcon />
      </IconButton>
      <Typography variant="h6">
        News
      </Typography>
      </AppBar>
      <Button variant="contained" color="primary">
        Hello World
      </Button>
    </div>
  )
}

ReactDOM.render(<App />, document.querySelector('#app'))

*/


let commandQueue: Command[] = []

const display = new Display()
const appDiv = document.getElementById('app')!!
display.mount(appDiv)
console.log('index: DISPLAY MOUNT')

appDiv.addEventListener('click', ev => {
  const rect = (ev.target as Element).getBoundingClientRect();
  const x = ev.clientX - rect.left; //x position within the element.
  const y = ev.clientY - rect.top; 
  const event = {
    x, y
  }
  console.log('click')
  ipcRenderer.send('event', event)
})

const commands: Command[] = [
  /*
  Command.size(0, 600, 400),
  Command.rect(0, 14, 23, 15, 25),
  Command.cstroke(0, ChannelMask.ATOP),
  Command.rect(1, 30, 30, 50, 60),
  Command.cfill(1, ChannelMask.ATOP, 100, 150, 5, 255/2.0),
  Command.arc(2, 40, 40, 10, 0, 2 * Math.PI, 0),
  Command.cstroke(2, ChannelMask.ATOP),
  */
]

commands.forEach(command => {
  console.log(`received: ${command}`)
  //display.exec(command)
})

ipcRenderer.on('commands', (event: any, commands: Command[]) => {
  commands.forEach(command => commandQueue.push(command))
})

const drawFrame = () => {
  commandQueue.forEach(cmd => {
    if (cmd[0] == 'sync') {
      display.flush()
    } else {
      display.exec(cmd)
    }
  })
  commandQueue = []
  window.requestAnimationFrame(drawFrame)
}
drawFrame()
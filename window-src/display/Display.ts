import { Layer } from './Layer'
import { Command, LayerCommand, LayerPathCompleteCommand } from './Command'
import jss from 'jss'
const { ipcRenderer } = require('electron')

const classes = jss.createStyleSheet({
  display: {
    position: 'relative'
  }
}).attach().classes

export class Display {
  #defaultLayer = Layer.create('layer-default')
  #element = document.createElement('div')

  constructor() {
    console.log("Display: CONSTRUCTOR")
    this.#element.className = classes.display
    this.#defaultLayer.mount(this.#element)
  }

  #layers: {[idx: number]: Layer} = {
    0: this.#defaultLayer
  }

  #getLayer = (idx: number): Layer => {
    console.log("Display: GET LAYER")
    console.log(this.#layers)
    /*
    console.log(idx)
    console.log(idx in this.#layers)
    console.log(this.#layers)
    */
    return idx in this.#layers ? this.#layers[idx] : this.#createLayer(idx)
  }

  #createLayer = (idx: number): Layer => {
    console.log("Display: LAYER CREATE")
    const layer = Layer.create(`layer-${idx}`)
    this.#layers[idx] = layer
    this.#defaultLayer.appendChild(layer)
    return layer
  }

  mount = (node: Element): void => {
    node.appendChild(this.#element)
  }

  exec = (c: Command): void => {
    switch (c[0]) {
      case 'size':
        const layer = c[1]
        if (layer == 0) {
          const width = c[2]
          const height = c[3]
          ipcRenderer.send('resize', width, height)
        }
        this.#execLayerCommand(c); 
        break;

      case 'rect': 
      case 'arc':
      case 'start':
      case 'line':
      case 'move':
      case 'close':
        this.#execLayerCommand(c); 
        break;

      case 'cfill':
      case 'cstroke': 
        this.#execLayerPathCompleteCommand(c); 
        break;

      default: 
        assertUnreachable(c)
    }
  }

  #execLayerCommand = (c: LayerCommand): void => {
    const layer = this.#getLayer(c[1])
    console.log(`Display.ts: #execLayerCommand(${c})`)
    switch (c[0]) {
      case 'rect':  layer.rect(c[2], c[3], c[4], c[5]); break;
      case 'arc':   layer.arc(c[2], c[3], c[4], c[5], c[6], c[7] > 0); break;
      case 'size':  layer.resize(c[2], c[3]); break;
      case 'start': layer.start(c[2], c[3]); break;
      case 'line':  layer.line(c[2], c[3]); break;
      case 'move': layer.move(c[2], c[3]); break;
      case 'close': layer.close(); break;
      default: 
        assertUnreachable(c)
    }
  }
  
  #execLayerPathCompleteCommand = (c: LayerPathCompleteCommand): void => {
    const layer = this.#getLayer(c[2])
    layer.setChannelMask(c[1])
    switch (c[0]) {
      case 'cstroke': layer.cstroke(c[3], c[4], c[5], c[6], c[7], c[8], c[9]); break;
      case 'cfill': layer.cfill(c[3], c[4], c[5], c[6]); break;
      default: assertUnreachable(c)
    }
  }
}

const assertUnreachable = (c: never): void => {
  throw ('UNREACHABLE: ' + c)
}
/*
const assertUnreachable = (c: never): never => {
  console.log('UNREACHABLE')
  //throw '!'
}
*/
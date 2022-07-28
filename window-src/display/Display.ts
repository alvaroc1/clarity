import { Layer } from './Layer'
import { ServerInstruction } from '../../guacamole/ServerInstruction'
import { MouseButton } from '../../protocol/Command'
import jss from 'jss'
import { ChannelMask } from '../../protocol/ChannelMask'
const { ipcRenderer } = require('electron')

const classes = jss.createStyleSheet({
  display: {
    position: 'relative'
  }
}).attach().classes

export interface MouseEv {
  x: number,
  y: number,
  buttons: Set<MouseButton>
}

export class Display {
  #defaultLayer: Layer

  #element: HTMLDivElement

  #layers: { [idx: number]: Layer }

  #tasks: Array<() => void> = []

  #mouseButtonsPressed: Set<MouseButton> = new Set()

  #onMouse: (ev: MouseEv) => void

  constructor(onMouse: (ev: MouseEv) => void) {
    const defaultLayer = Layer.create('layer-default', 200, 200)
    const element = document.createElement('div')
    element.className = classes.display

    this.#element = element
    this.#defaultLayer = defaultLayer
    this.#onMouse = onMouse
    this.#layers = {
      0: defaultLayer
    }

    // setup mouse events
    element.addEventListener('mousemove', ev => {
      this.#onMouse({
        x: ev.clientX,
        y: ev.clientY,
        buttons: this.#mouseButtonsPressed,
      })
    });
    element.addEventListener('mousedown', ev => {
      this.#mouseButtonsPressed = this.#numberToButtonSet(ev.buttons)
      console.log(this.#mouseButtonsPressed)
      this.#onMouse({
        x: ev.clientX,
        y: ev.clientY,
        buttons: this.#mouseButtonsPressed,
      })
    });
    element.addEventListener('mouseup', ev => {
      this.#mouseButtonsPressed = this.#numberToButtonSet(ev.buttons)
      this.#onMouse({
        x: ev.clientX,
        y: ev.clientY,
        buttons: this.#mouseButtonsPressed,
      })
    });
  }

  #numberToButtonSet = (n: number): Set<MouseButton> => {
    const s = new Set<MouseButton>()
    const allButtons = [MouseButton.Left, MouseButton.Middle, MouseButton.Right, MouseButton.ScrollUp, MouseButton.ScrollDown]
    allButtons.forEach((but: MouseButton) => {
      if ((n & (1 << but)) !== 0) {
        s.add(Math.pow(2, but))
      }
    })
    return s
  }


  #getLayer = (idx: number): Layer => {
    return idx in this.#layers ? this.#layers[idx] : this.#createLayer(idx)
  }

  #createLayer = (idx: number): Layer => {
    console.log("Display: LAYER CREATE")
    const layer = Layer.create(`layer-${idx}`, 200, 200)
    this.#layers[idx] = layer

    // only mount if >= 0
    if (idx >= 0) {
      this.#defaultLayer.appendChild(layer)
    }
    return layer
  }

  mount = (node: Element): void => {
    console.log("Display: MOUNT")
    node.appendChild(this.#element)
    this.#defaultLayer.mount(this.#element)
  }

  flush = (callback: () => void) => {
    window.requestAnimationFrame(() => {
      this.#tasks.forEach(t => t())
      this.#tasks = []
      callback();
    })
  }

  exec = (c: ServerInstruction): void => {
    this.#tasks.push(() => {
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

        case 'copy':
          const srcLayer = this.#getLayer(c[1])
          const [sx, sy, sw, sh, cm] = [c[2], c[3], c[4], c[5], c[6]]
          const dstLayer = this.#getLayer(c[7])
          const [dx, dy] = [c[8], c[9]]

          const savedCompositeOperation = dstLayer.context.globalCompositeOperation
          switch (cm) {
            case ChannelMask.SRC:
              // if this is a copy operation, 
              // it's actually better if we clear a rect and use source-over
              dstLayer.context.clearRect(dx, dy, sw, sh)
              dstLayer.context.globalCompositeOperation = 'source-over';
              break;
            default: dstLayer.context.globalCompositeOperation = (ChannelMask.toHtmlCanvasCompositeOperation(cm) as GlobalCompositeOperation); break;
          }

          dstLayer.context.drawImage(
            srcLayer.canvas,
            sx * window.devicePixelRatio,
            sy * window.devicePixelRatio,
            sw * window.devicePixelRatio,
            sh * window.devicePixelRatio,
            dx, dy,
            sw, sh
          )

          dstLayer.context.globalCompositeOperation = savedCompositeOperation
          break;

        case 'rect':
        case 'arc':
        case 'start':
        case 'line':
        case 'move':
        case 'close':
        case 'transform':
        case 'identity':
        case 'push':
        case 'pop':
        case 'curve':
          this.#execLayerCommand(c);
          break;

        case 'cfill':
        case 'cstroke':
          this.#execLayerPathCompleteCommand(c);
          break;

        case 'sync':
        case 'select':
          throw `There should not be control commands here, got: ${c[0]}`

        default:
          assertUnreachable(c)
      }
    })
  }

  #execLayerCommand = (c: ServerInstruction.LayerCommand): void => {
    const layer = this.#getLayer(c[1])
    switch (c[0]) {
      case 'rect': layer.rect(c[2], c[3], c[4], c[5]); break;
      case 'arc': layer.arc(c[2], c[3], c[4], c[5], c[6], c[7]); break;
      case 'size': layer.resize(c[2], c[3]); break;
      case 'start': layer.start(c[2], c[3]); break;
      case 'line': layer.line(c[2], c[3]); break;
      case 'curve': layer.curve(c[2], c[3], c[4], c[5], c[6], c[7]); break;
      case 'move': layer.move(c[2], c[3]); break;
      case 'close': layer.close(); break;
      case 'identity': layer.identity(); break;
      case 'transform': layer.transform(c[2], c[3], c[4], c[5], c[6], c[7]); break;
      case 'push': layer.push(); break;
      case 'pop': layer.pop(); break;
      default:
        assertUnreachable(c)
    }
  }

  #execLayerPathCompleteCommand = (c: ServerInstruction.LayerPathCompleteCommand): void => {
    const layer = this.#getLayer(c[2])
    layer.setChannelMask(c[1])
    switch (c[0]) {
      case 'cstroke': layer.cstroke(c[3], c[4], c[5], c[6][0], c[6][1], c[6][2], c[6][3]); break;
      case 'cfill': layer.cfill(c[3][0], c[3][1], c[3][2], c[3][3]); break;
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
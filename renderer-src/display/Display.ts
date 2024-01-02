/* eslint-disable no-case-declarations */
import { Layer } from './Layer'
import { RenderCommand } from '../../guacamole/ServerInstruction'
import { MouseButton } from '../../drawing/MouseButton'
import jss from 'jss'
import { ChannelMask } from '../../drawing/ChannelMask'

const classes = jss.createStyleSheet({
  display: {
    position: 'relative',
    width: '100%',
    height: '100%'
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
    const defaultLayer = Layer.create(200, 200)
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
    })
    element.addEventListener('mousedown', ev => {
      this.#mouseButtonsPressed = this.#numberToButtonSet(ev.buttons)
      console.log(this.#mouseButtonsPressed)
      this.#onMouse({
        x: ev.clientX,
        y: ev.clientY,
        buttons: this.#mouseButtonsPressed,
      })
    })
    element.addEventListener('mouseup', ev => {
      this.#mouseButtonsPressed = this.#numberToButtonSet(ev.buttons)
      this.#onMouse({
        x: ev.clientX,
        y: ev.clientY,
        buttons: this.#mouseButtonsPressed,
      })
    })
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
    const layer = Layer.create(200, 200)
    this.#layers[idx] = layer

    // only mount if >= 0
    if (idx >= 0) {
      this.#defaultLayer.appendChild(layer)
    }
    return layer
  }

  mount = (node: Element): void => {
    node.appendChild(this.#element)
    this.#defaultLayer.mount(this.#element)
  }

  flush = (callback: () => void) => {
    window.requestAnimationFrame(() => {
      let task = this.#tasks.shift()
      while (task !== undefined) {
        task()
        task = this.#tasks.shift()
      }
      callback()
    })
  }

  exec = (c: RenderCommand): void => {
    this.#tasks.push(() => {
      switch (c[0]) {
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
              // TODO: why?
              dstLayer.context.clearRect(dx, dy, sw, sh)
              dstLayer.context.globalCompositeOperation = 'source-over'
              break
            default: 
              dstLayer.context.globalCompositeOperation = ChannelMask.toHtmlCanvasCompositeOperation(cm)
              break
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
          break

        case 'size': 
          this.#getLayer(c[1]).resize(c[2], c[3])
          break
        case 'rect': 
          this.#getLayer(c[1]).rect(c[2], c[3], c[4], c[5])
          break
        case 'arc':
          this.#getLayer(c[1]).arc(c[2], c[3], c[4], c[5], c[6], c[7])
          break
        case 'start':
          this.#getLayer(c[1]).start(c[2], c[3])
          break
        case 'line':
          this.#getLayer(c[1]).line(c[2], c[3]) 
          break
        case 'move':
          this.#getLayer(c[1]).move(c[2], c[3])
          break
        case 'close':
          this.#getLayer(c[1]).close(); break
        case 'transform':
          this.#getLayer(c[1]).transform(c[2], c[3], c[4], c[5], c[6], c[7])
          break
        case 'identity':
          this.#getLayer(c[1]).identity()
          break
        case 'push':
          this.#getLayer(c[1]).push()
          break
        case 'pop':
          this.#getLayer(c[1]).pop()
          break
        case 'curve':
          this.#getLayer(c[1]).curve(c[2], c[3], c[4], c[5], c[6], c[7])
          break
        case 'cfill': {
          const layer = this.#getLayer(c[2])
          layer.setChannelMask(c[1])
          layer.cfill(c[3][0], c[3][1], c[3][2], c[3][3]); break
        }
        case 'cstroke': {
          const layer = this.#getLayer(c[2])
          layer.setChannelMask(c[1])
          layer.cstroke(c[3], c[4], c[5], c[6][0], c[6][1], c[6][2], c[6][3])
          break
        }

        default:
          assertUnreachable(c)
      }
    })
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
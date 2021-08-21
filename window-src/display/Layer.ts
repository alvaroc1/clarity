import {Cap, Join} from './Command'
import {ChannelMask} from './ChannelMask'
import jss from 'jss'

const classes = jss.createStyleSheet({
  layerContainer: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  layerCanvas: {
    outline: '4px dotted #555555'
  }
}).attach().classes

export class Layer {
  #label: string
  #canvas: HTMLCanvasElement
  #ctx: CanvasRenderingContext2D
  #container: HTMLDivElement
  #pathClosed: boolean = true
  #children: Layer[] = []

  get container () {
    return this.#container
  }

  private constructor (label: string) {
    this.#label = label
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200
    canvas.className = classes.layerCanvas

    const container = document.createElement('div')
    container.className = classes.layerContainer

    container.appendChild(canvas)

    const ctx = canvas.getContext('2d')!!
    ctx.transform(3, 0, 0, 3, 0, 0)
    console.log('SCALING')
    //ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 5

    this.#canvas = canvas
    this.#ctx = ctx
    this.#container = container
  }

  setChannelMask = (mask: ChannelMask): void => {
    //console.log(`Not setting channel mask: ${mask}`)
    this.#ctx.globalCompositeOperation = ChannelMask.toHtmlCanvasCompositeOperation(mask)
    //console.log(mask)
    //console.log(this.#ctx.globalCompositeOperation)
  }

  appendChild = (child: Layer): void => {
    this.#children.push(child)
    this.#container.appendChild(child.container)
  }

  #startPathIfNecessary = () => {
    if (this.#pathClosed) {
      console.log("BEGIN PATH")
      this.#ctx.beginPath()
      this.#pathClosed = false
    }
  }

  rect = (x: number, y: number, width: number, height: number): void => {
    this.#startPathIfNecessary()
    this.#ctx.rect(x, y, width, height)
  }

  arc = (x: number, y: number, radius: number, startAngle: number, endAngle: number, negative: boolean): void => {
    this.#startPathIfNecessary()
    this.#ctx.arc(x, y, radius, startAngle, endAngle, negative)
  }

  start = (x: number, y: number): void => {
    this.#startPathIfNecessary()
    this.#ctx.moveTo(x, y)
  }

  line = (x: number, y: number): void => {
    this.#ctx.lineTo(x, y)
  }

  cstroke = (cap: Cap, join: Join, thickness: number, r: number, g: number, b: number, a: number): void => {
    this.#ctx.lineWidth = thickness
    this.#ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + a/255.0 + ")"
    this.#ctx.stroke()
    this.#pathClosed = true
  }

  cfill = (r: number, g: number, b: number, a: number): void => {
    this.#ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a/255.0 + ")"
    this.#ctx.fill()
    this.#pathClosed = true
  }

  resize = (width: number, height: number): void => {
    const canvasWidth  = Math.ceil(width  / CANVAS_SIZE_FACTOR) * CANVAS_SIZE_FACTOR
    const canvasHeight = Math.ceil(height / CANVAS_SIZE_FACTOR) * CANVAS_SIZE_FACTOR

    console.log(width)
    console.log(canvasWidth)

    if (this.#canvas.width !== canvasWidth || this.#canvas.height !== canvasHeight) {
      this.#canvas.width = canvasWidth
      this.#canvas.height = canvasHeight
    }
  }

  move = (x: number, y: number): void => {
    this.#container.style.left = `${x}px`
    this.#container.style.top = `${y}px`
  }

  close = (): void => {
    this.#ctx.closePath()
  }

  mount = (element: Element): void => {
    element.appendChild(this.#container)
  }

  static create = (label: string): Layer => new Layer(label)
}

/* What is this? maybe from when trying to draw the othello board */
//const CANVAS_SIZE_FACTOR = 64
const CANVAS_SIZE_FACTOR = 1
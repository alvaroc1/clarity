import { Cap, Join } from '../../protocol/Command'
import { ChannelMask } from '../../protocol/ChannelMask'
import jss from 'jss'

const classes = jss.createStyleSheet({
  layerContainer: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  layerCanvas: {
    outline: '1px solid #555555'
  }
}).attach().classes

export class Layer {
  #label: string
  #canvas: HTMLCanvasElement
  #ctx: CanvasRenderingContext2D
  #container: HTMLDivElement
  #pathClosed: boolean = true
  #children: Layer[] = []
  #transformStack: number = 0

  get container() {
    return this.#container
  }

  get context() {
    return this.#ctx;
  }

  get canvas() {
    return this.#canvas;
  }

  private constructor(label: string, width: number, height: number) {
    console.log("Layer: constructor")
    this.#label = label
    const canvas = document.createElement('canvas')
    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.className = classes.layerCanvas

    const container = document.createElement('div')
    container.className = classes.layerContainer

    container.appendChild(canvas)

    const ctx = canvas.getContext('2d')!!

    // scale to match pixel ratio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    this.#canvas = canvas
    this.#ctx = ctx
    this.#container = container

    //Layer.drawGrid(ctx, width, height)
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
    this.#ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + a / 255.0 + ")"
    this.#ctx.stroke()
    this.#pathClosed = true
  }

  cfill = (r: number, g: number, b: number, a: number): void => {
    this.#ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a / 255.0 + ")"
    this.#ctx.fill()
    this.#pathClosed = true
  }

  resize = (width: number, height: number): void => {
    const canvasWidth = Math.ceil(width)
    const canvasHeight = Math.ceil(height)

    const newCanvasWidth = canvasWidth * window.devicePixelRatio
    const newCanvasHeight = canvasHeight * window.devicePixelRatio

    if (this.#canvas.width !== newCanvasWidth || this.#canvas.height !== newCanvasHeight) {
      // save contents
      const tmp = document.createElement('canvas') as HTMLCanvasElement

      document.body.appendChild(tmp)
      tmp.width = this.#canvas.width
      tmp.height = this.#canvas.height
      const tmpCtx = tmp.getContext('2d')!!
      tmpCtx.drawImage(this.#canvas, 0, 0, this.#canvas.width, this.#canvas.height, 0, 0, this.#canvas.width, this.#canvas.height)

      // save transform
      const transformMatrix = this.#ctx.getTransform()

      // resize
      this.#canvas.width = newCanvasWidth
      this.#canvas.height = newCanvasHeight
      this.#canvas.style.width = `${canvasWidth}px`
      this.#canvas.style.height = `${canvasHeight}px`

      // restore contents
      this.#ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, tmp.width, tmp.height)

      // restore transform
      this.#ctx.setTransform(transformMatrix)
    }
  }

  move = (x: number, y: number): void => {
    this.#container.style.left = `${x}px`
    this.#container.style.top = `${y}px`
  }

  close = (): void => {
    this.#ctx.closePath()
  }

  identity = (): void => {
    this.#ctx.resetTransform()
  }

  transform = (a: number, b: number, c: number, d: number, e: number, f: number): void => {
    this.#ctx.transform(a, b, c, d, e, f)
  }

  curve = (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => {
    this.#ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)
  }

  //TODO: keep track of the stack size
  push = (): void => {
    this.#ctx.save()
    this.#transformStack++
  }

  pop = (): void => {
    // this check prevents popping the device pixel ratio transformation
    if (this.#transformStack > 0) {
      this.#ctx.restore()
      this.#transformStack--
    }
  }

  mount = (element: Element): void => {
    element.appendChild(this.#container)
  }

  static create = (label: string, width: number, height: number): Layer => new Layer(label, width, height)

  static drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const oldLineDash = ctx.getLineDash()
    ctx.beginPath()
    ctx.setLineDash([1])
    for (let x = 0; x <= width; x += 25) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    }
    for (let y = 0; y <= height; y += 25) {
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.setLineDash(oldLineDash)
  }
}

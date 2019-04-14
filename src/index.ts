import * as easing from './easing'
import { Easing } from './easing'

const noop = () => { }

type Fn = () => void
type UpdateFn = (t: number) => void

class Tween {

  private _onStart: Fn = noop
  private _onEnd: Fn = noop
  private _onUpdate: UpdateFn = noop

  constructor (private duration: number,
               private easing: Easing) {
  }

  public onStart (onStart: Fn): this {
    this._onStart = onStart
    return this
  }

  public onEnd (onEnd: Fn): this {
    this._onEnd = onEnd
    return this
  }

  public onUpdate (onUpdate: UpdateFn): this {
    this._onUpdate = onUpdate
    return this
  }

  public run (): void {
    this._onStart()

    const p0 = Date.now()
    const p1 = p0 + this.duration

    const loop = () => {
      const p = Date.now()
      const t = (p - p0) / this.duration
      if (p > p1) {
        this._onEnd()
      } else {
        this._onUpdate(this.easing(t))
        requestAnimationFrame(loop)
      }
    }

    loop()
  }

}

export const tween = (duration: number, easing: Easing) => new Tween(duration, easing)

export { easing }

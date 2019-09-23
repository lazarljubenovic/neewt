import { Easing } from './easing'

/**
 * A representation of a Neewt tween.
 */
export type Tween = number & { __FAKE_TWEEN_ID: number }

const noop = () => { }

export enum EndReason {
  Natural,
  Forced,
}

export type StartFn = () => void
export type UpdateFn = (t: number) => void
export type EndFn = (reason: EndReason, tween: Tween) => void

export class InternalTweenClass {

  public start!: number
  public end!: number

  public isFirstFrame = true

  constructor (public id: Tween,
               public delay: number,
               public duration: number,
               public easing: Easing,
               public onStart: StartFn = noop,
               public onUpdate: UpdateFn = noop,
               public onEnd: EndFn = noop) {
  }

}

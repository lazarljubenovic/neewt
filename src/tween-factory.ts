import { Easing } from './easing'
import { EndFn, StartFn, InternalTweenClass, Tween, UpdateFn } from './tween'
import { getDefaultSingletonManager } from './manager'

let id = 1 as Tween

export interface TweenHandlers {
  onStart?: StartFn
  onUpdate: UpdateFn
  onEnd?: EndFn
}

export function tween (duration: number, easing: Easing, tweenHandlers: TweenHandlers): Tween
export function tween (delay: number, duration: number, easing: Easing, tweenHandlers: TweenHandlers): Tween
export function tween (...args: any[]): Tween {
  const tweenId = id
  id = (id + 1) as Tween

  const delay: number = args.length == 3 ? 0 : args[0]
  const duration: number = args.length == 3 ? args[0] : args[1]
  const easing: Easing = args.length == 3 ? args[1] : args[2]
  const tweenHandlers: TweenHandlers = args.length == 3 ? args[2] : args[3]
  const { onStart, onUpdate, onEnd } = tweenHandlers

  const tween = new InternalTweenClass(tweenId, delay, duration, easing, onStart, onUpdate, onEnd)
  const manager = getDefaultSingletonManager()
  manager.add(tween)

  return tweenId
}

/**
 * Synchronously finish the tween immediately. The update function will be called for the last frame
 * and the `onEnd` will run, giving `EndReason.Forced` as the reason.
 *
 * @param {Tween} tween The ID of the tween to remove.
 * @return {boolean} Indicates if a tween with given ID was found.
 */
export function finishTween (tween: Tween): boolean {
  const manager = getDefaultSingletonManager()
  const didStop = manager.finish(tween)
  return didStop
}

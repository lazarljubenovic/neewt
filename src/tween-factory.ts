import { Easing } from './easing'
import { EndFn, StartFn, InternalTweenClass, Tween, UpdateFn } from './tween'
import { getDefaultSingletonManager } from './manager'

let id = 1 as Tween

export interface TweenHandlers {
  onStart?: StartFn
  onUpdate: UpdateFn
  onEnd?: EndFn
}

export function tween (duration: number, easing: Easing, { onStart, onUpdate, onEnd }: TweenHandlers): Tween {
  const tweenId = id
  id = (id + 1) as Tween

  const tween = new InternalTweenClass(tweenId, duration, easing, onStart, onUpdate, onEnd)
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

import { EndReason, InternalTweenClass, Tween } from './tween'

type Raf = (frame: () => void) => void

const defaultRaf = (cb: () => void) => requestAnimationFrame(cb)
const defaultGetTime = () => Date.now()


export class Manager {

  private tweens = new Map<Tween, InternalTweenClass>()

  public constructor (
    private getTime: () => number = defaultGetTime,
    private raf: Raf = defaultRaf,
  ) {
    this.run()
  }

  public add (tween: InternalTweenClass) {
    tween.start = this.getTime()
    tween.end = tween.start + tween.duration
    this.tweens.set(tween.id, tween)
  }

  public finish (tweenId: Tween): boolean {
    const tween = this.tweens.get(tweenId)
    if (tween == null) return false
    tween.onEnd(EndReason.Forced, tweenId)
    this.tweens.delete(tweenId)
    return true
  }

  public run () {
    const loop = () => {

      // We store tweens that ended and later remove them in order not to mess with
      // iteration of the tweens in the loop (we don't want to remove items from th
      // collection while iterating over that collection).
      const ended = new Set<Tween>()

      for (const [tweenId, tween] of this.tweens) {

        // Run the `onStart` hook, if needed.
        if (tween.isFirstFrame) {
          tween.onStart()
          tween.isFirstFrame = false
        }

        // We know where we are in the tween's lifecycle based on the current time.
        // We do NOT count frames. This is what makes Neewt FPS-independent.
        const timestamp = this.getTime()

        // If we've reached the end, finalize the tween.
        // Otherwise, just do the update.
        if (timestamp >= tween.end) {
          // We could be overshooting by a bit here, eg. tween ends at 100, and we run this at 91 and 101.
          // We don't want to display the overshoot visually, but display the correct ending frame.
          tween.onUpdate(1)
          tween.onEnd(EndReason.Natural, tweenId)
          ended.add(tweenId)
        } else {
          const t = (timestamp - tween.start) / tween.duration
          tween.onUpdate(tween.easing(t))
        }
      }

      // Now delete all finished tweens.
      // This should remove all references, so GC can kick in and swipe things away.
      ended.forEach(id => this.tweens.delete(id))

      // Call the loop over and over.
      this.raf(loop)

    }

    loop()
  }

}

let defaultSingletonManager: Manager | undefined

export function getDefaultSingletonManager (): Manager {
  if (defaultSingletonManager == null) {
    defaultSingletonManager = new Manager()
    defaultSingletonManager.run()
  }
  return defaultSingletonManager
}

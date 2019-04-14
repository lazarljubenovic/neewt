export type Easing = (t: number) => number

export const linear: Easing = t => t

export const easeInQuad: Easing = t => t * t

export const easeOutQuad: Easing = t => t * (2 - t)

export const easeInOutQuad: Easing = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t

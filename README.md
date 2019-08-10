# neewt

A simple tweening library.

## Overview

- [**Concept**](#concept) briefly explains what's a tween.
- [**Installation**](#installation) is for your copy-paste needs.
- [**API**](#api) is a very detailed explanation of everything that the library exposes.
- [**FAQ**](#faq) is a list of questions that I assume people might want an answer to. Nobody has _actually_ asked me any of those, so they're not that frequent at all.

## Concept

A tween is a representation of a timeline of a single animation. In the basic case, it emits values from 0 to 1, according to the provided easing function.

For example, we can animate “fade in” appearance of an object by rapidly changing its opacity style from zero (invisible) to one (fully visible). A tween would then emit values from 0 to 1 for each frame of the animation, eg. `0`, `0.25`, `0.5` and `1` in case the animation is linear and needs to be done in four frames.

## Installation

```
$ yarn add neewt
```

## API

### `tween(duration, easing, { onStart, onUpdate, onEnd })`

Creates a tween and immediately schedules it to run. Unless the duration is 0, the animation will kick off in the next animation frame (ie. asynchronously). All tweens you create are executed under the same `requestAnimationFrame` call, so there's usually no need for optimizing for less tweens, except in extreme cases.

It returns a `Tween` which can be optionally stored somewhere and passed to `finishTween`. 

#### `duration: number`

How long the tween will run, in milliseconds.

Note that this can never be exactly precise because the animations frames are triggered at around 16ms. The library handles that no overshoot is ever visible, and when the tween ends, the value `1` will be emitted (instead of something like `1.001` which would be more correct in terms of the timeline, but probably not what the visual result should be).

If `0` is given, the update will happen synchronously and the tween will be immediately marked as finished. If you need an instantaneous asynchronous animation, use a different small number for duration (such as `1`).

#### `easing: (t: number) => number`

Easing describes the way the animation accelerates. Mathematically, the simplest way to move an object from point A to point B is to give it a constant velocity. However, this is rarely how things move in the real world; which is why animations are rarely created this way.

A more natural way for the object to move from A to B is to start slowly, accelerate and reach the maximum speed somewhere along the way, and then decelerate before reaching its destination. This type of easing is usually called _ease-in-out_, and is often accompanied by words like _quad_ and _cubic_ which describes the acceleration/deceleration rates more accurately.

Two more easing functions are commonly used for simple transitions: _ease-in_ and _ease-out_, which are similar to the previous but one-sided. _Ease-in_ animation will start slowly, and then accelerate right all the way, even in the its final moments. This type of easing is usually used when the object is moving away from the screen; we see it flying out of the screen in full speed, because we assume that its resting position is somewhere far off, outside the edges of the screen. Similarly, objects which enter the screen are coming in from far away, and thus when they first appear within the screen boundaries, they have their full velocity, slowly decelerating as they approach their resting place on the screen (which is _ease-out_ function).

Mathematically, an easing function is a function which transform a linear change from 0 to 1 into a different type of change. So, the linear easing function would be a simple identity function: `(t: number) => t`. The quadratic ease in function is a basic parabola: `(t: number) => t * t`. Neewt comes with a few built-in easing functions, all exported under the name [`easing`](#easing).

#### `onUpdate: (v: number) => void`

As explained, the purpose of the tween is to rapidly fire numbers which the consumer can use to create an illusion of some sort of movement by rapidly re-drawing slightly different images. This is the function where the consumer defines how the tween affects the animation.

For example, one could move the object from `(0, 0)` to `(0, 300)` with the following update function:

```typescript
onUpdate: v => {
  object.setPosition(0, v * 300)
}
```

#### `onStart: () => void`

A function called when the tween starts. 

It's tempting to think that this hook is useless because the animation starts when the tween is created; however in most cases this is not true. When you specify a non-zero `duration` as the first argument to the `tween` function, it only schedules the animation to run in the next frame. Although this is “close enough” for most cases, it could case unexpected flashes if you want to make your object visible before animating it in.

```typescript
object.setVisibility(true)
tween(300, easing.linear, {
  onUpdate: v => object.setOpacity(v),
})

// Too early. The object is fully visible for one frame, before opacity is set to 0.
```

Above code will case a one-frame flicked in whcih the object is fully visible, before becoming completely invisible when the `onUpdate` is called for the first time. To avoid this, use the `onStart` hook.

```typescript

tween(300, easing.linear, {
  onStart: () => object.setVisibility(true),
  onUpdate: v => object.setOpacity(v),
}) 

// Object is set to visible and its opacity is set to 0 at the same frame.
```

#### `onEnd: (endReason) => void`

A hook to call when the animation ends. You can run some clean-up code, unfreeze the Ui, or run the next animation in sequence here. It's entirely up to you.

The hook will provide the reason for ending as an enumeration [`EndReason`](#end-reason), which you can use to know whether the tween ended naturally or its end was forced via [`finishTween`](#finishtweentween).
  

### `finishTween(tween)`

Creating a tween with `tween` will result in a `Tween` object, which can be stored somewhere in case the situation calls for the need to cancel the animation prematurely, causing the tween to cease firing values and emitting the final `1` immediately, thus placing the animation in its final position.

If the tween has already finished, nothing will happen (so you don't have to check for this case when calling the function). But if you need to know whether the function call actually stopped the tween, you can look at its return value: `true` means that tween was ended prematurely, while `false` means that the call didn't do anything because the tween has already been completed (naturally or via a `finishTween` call).

### `easing`

Four easing functions are currently available for convenient use when providing it as the second argument to `tween` function.

- **linear**: `t => t`,
- **easeInQuad**: `t => t * t`,
- **easeOutQuad**: `t => t * (2 - t)` and
- **easeInOutQuad**: `t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t`.
  
Of course, creating your own easing function is available, as they are simple JavaScript functions which accept a number and return a number.

Internally, `easing` is not a regular object, but a so-called “exotic object” created as the result of a re-exported namespace import. This means that only the functions you use will be a part of the final bundle if you use a common solution for tree-shaking your code such as Rollup. Thus, you do not have to worry that you will bloat your code with the rest just by using one of them, while still keeping all the easing functions easily accessible without importing each one separately. 

### `EndReason`

An enumeration used in the [`onEnd`](#onend-endreason--void) hook which allows the consumer to differentiate between natural ending of the tween and a forced one via a [`finishTween`](#finishtweentween) function call.

It defines two values:

- `Natural` and
- `Forced`.

### `Tween`

A type which represents the tween from the consumer's perspective. Returned by [`tween`](#tween-duration-easing-onstart-onupdate-onend) when creating it, and used by [`finishTween`](#finioshtwen-tween) as the argument in order to reference it.

It purposely hides the implementation details of _what_ it actually is. Thus, it should not be used in any other contexts, as its shape is an implementation detail which can change at any update without warnings for a breaking change. 

## Examples

The page is empty for one second. Then, a red rectangle appears for one second.

```typescript
const object = document.createElement('div')
object.style.backgroundColor = `red`
object.style.width = `100px`
object.style.height = `100px`
object.hidden = true

setTimeout(() => {
  tween(1000, easing.easeOutQuad, {
    onStart: () => object.hidden = false,
    onUpdate: v => object.style.opacity = `${v}`,
  })  
}, 1000)
```

## FAQ

### Q: How is Neewt different from XYZ?

> It's probably simpler than XYZ. Instead of providing a full out-of-the-box solution for very complex cases, it comes with the bare minimum, allowing full control by the consumer. It's by no means an animation framework, but a simple utility library.

### Q: What's the name?

> It's "tween", reversed. 

### Q: How to develop Neewt locally?

> I don't have a “testing area” set up. You'll have to build the project with `yarn build` and use [`yarn link`](https://yarnpkg.com/lang/en/docs/cli/link/) to test it out in a different project.

### Q: Why are there no tests?

> Because I'm lazy yet confident; a bad combination. I'd appreciate a PR for it.

### Q: Can you add a XYZ easing function?

> Probably, as long as you provide a reference to another easing library or animation framework (any language or platform) which also uses it. Just open an issue with relevant info.

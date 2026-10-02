import { animate, cancelFrame, frame, motionValue, useReducedMotion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { COURSE_TRANSITION_DURATION, COURSE_TRANSITION_EASE } from '../data/motion'

const CARD_COLORS = { active: '#C33241', inactive: '#F9EBEC' }

type ColorWipe = {
  inside: ColorPaint
  radius: MotionValue<number>
  expanding: boolean
}

type ColorPaint = {
  color: string
  underlay?: ColorPaint
  wipe?: ColorWipe
}

type ColorScene = {
  active: boolean
  reduced: boolean | null
  paint: ColorPaint
}

function CircularColorLayer({ wipe }: { wipe: ColorWipe }) {
  const layerRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const updateMask = () => {
      const radius = wipe.radius.get()
      const boundedRadius = Math.max(0, Math.min(150, radius))
      const x = boundedRadius / 150 * 100
      const layer = layerRef.current
      if (!layer) return

      // Counter Motion's layout scaling so the wipe remains circular.
      const bounds = layer.getBoundingClientRect()
      const style = getComputedStyle(layer)
      const width = Number.parseFloat(style.width)
      const height = Number.parseFloat(style.height)
      if (!bounds.width || !bounds.height || !width || !height)
        return
      const screenRadius = Math.hypot(bounds.width, bounds.height) / Math.SQRT2 * boundedRadius / 100
      const radiusX = screenRadius * width / bounds.width
      const radiusY = screenRadius * height / bounds.height
      layer.style.clipPath = `ellipse(${radiusX}px ${radiusY}px at ${x}% ${100 - x}%)`
    }
    updateMask()
    // Refresh the mask after Motion applies its layout transform.
    frame.postRender(updateMask, true)
    return () => cancelFrame(updateMask)
  }, [wipe])

  return (
    <div ref={layerRef} className="course-color-wipe">
      <ColorSurface paint={wipe.inside} />
    </div>
  )
}

function ColorSurface({ paint }: { paint: ColorPaint }) {
  return (
    <div className="course-color-surface" style={{ backgroundColor: paint.color }}>
      {paint.underlay && <ColorSurface paint={paint.underlay} />}
      {paint.wipe && <CircularColorLayer wipe={paint.wipe} />}
    </div>
  )
}

export function CourseCardBackground({ active }: { active: boolean }) {
  const reduced = useReducedMotion()
  const [scene, setScene] = useState<ColorScene>({
    active, reduced, paint: { color: active ? CARD_COLORS.active : CARD_COLORS.inactive },
  })

  // Prepare the next color state before paint.
  if (scene.active !== active || scene.reduced !== reduced) {
    const color = active ? CARD_COLORS.active : CARD_COLORS.inactive
    const shouldAnimate = scene.active !== active && !reduced
    setScene({
      active, reduced,
      paint: shouldAnimate
        ? active
          ? { color, wipe: { inside: scene.paint, radius: motionValue(150), expanding: false } }
          : { color, underlay: scene.paint, wipe: { inside: { color }, radius: motionValue(0), expanding: true } }
        : { color },
    })
  }

  useLayoutEffect(() => {
    const paint = scene.paint
    const wipe = paint.wipe
    if (!wipe) return
    // Retain the current paint tree when a transition is interrupted.
    const animation = animate(wipe.radius, wipe.expanding ? 150 : 0, {
      duration: COURSE_TRANSITION_DURATION,
      ease: COURSE_TRANSITION_EASE,
      onComplete: () => {
        setScene((current) => current.paint === paint
          ? { ...current, paint: { color: paint.color } }
          : current)
      },
    })
    return () => animation.stop()
  }, [scene.paint])

  return (
    <div className="course-background" style={{ backgroundColor: scene.paint.color }} aria-hidden="true">
      <ColorSurface paint={scene.paint} />
    </div>
  )
}

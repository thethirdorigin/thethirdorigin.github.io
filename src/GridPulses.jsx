import { useEffect, useRef, useState } from 'react'

const GRID_SIZE = 60
const TRAIL_LENGTH = 140

// Spawns Tron-style light pulses that travel along the background grid lines
// at random intervals. Purely decorative; sits behind the page content.
function GridPulses() {
  const wrapperRef = useRef(null)
  const [pulses, setPulses] = useState([])

  useEffect(() => {
    let nextId = 0
    const timeouts = new Set()

    const later = (fn, ms) => {
      const t = setTimeout(() => {
        timeouts.delete(t)
        fn()
      }, ms)
      timeouts.add(t)
    }

    const spawn = () => {
      const wrapper = wrapperRef.current
      if (!wrapper) return

      const horizontal = Math.random() < 0.5
      const reverse = Math.random() < 0.5
      const cyan = Math.random() < 0.35
      const duration = 2 + Math.random() * 2.5

      let line
      if (horizontal) {
        // Pick a horizontal grid line within the visible viewport
        const y = window.scrollY + Math.random() * window.innerHeight
        line = Math.min(
          Math.round(y / GRID_SIZE) * GRID_SIZE,
          Math.floor(wrapper.clientHeight / GRID_SIZE) * GRID_SIZE
        )
      } else {
        const maxLine = Math.floor(wrapper.clientWidth / GRID_SIZE)
        line = (1 + Math.floor(Math.random() * (maxLine - 1))) * GRID_SIZE
      }

      const pulse = {
        id: nextId++,
        horizontal,
        reverse,
        cyan,
        duration,
        line,
        top: horizontal ? line : window.scrollY,
      }
      setPulses((prev) => [...prev, pulse])
      later(() => {
        setPulses((prev) => prev.filter((p) => p.id !== pulse.id))
      }, duration * 1000)
    }

    const loop = () => {
      later(() => {
        spawn()
        loop()
      }, 1500 + Math.random() * 4500)
    }
    loop()

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="grid-pulses" ref={wrapperRef} aria-hidden="true">
      {pulses.map((p) => (
        <div
          key={p.id}
          className={[
            'grid-pulse',
            p.horizontal ? 'horizontal' : 'vertical',
            p.reverse ? 'reverse' : '',
            p.cyan ? 'cyan' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            p.horizontal
              ? { top: `${p.line}px`, animationDuration: `${p.duration}s` }
              : {
                  left: `${p.line}px`,
                  top: `${p.top}px`,
                  animationDuration: `${p.duration}s`,
                }
          }
        />
      ))}
    </div>
  )
}

export default GridPulses

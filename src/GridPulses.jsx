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

      let line
      let travel
      if (horizontal) {
        // Pick a horizontal grid line within the visible viewport
        const y = window.scrollY + Math.random() * window.innerHeight
        line = Math.min(
          Math.round(y / GRID_SIZE) * GRID_SIZE,
          Math.floor(wrapper.clientHeight / GRID_SIZE) * GRID_SIZE
        )
        travel = wrapper.clientWidth
      } else {
        const maxLine = Math.floor(wrapper.clientWidth / GRID_SIZE)
        line = (1 + Math.floor(Math.random() * (maxLine - 1))) * GRID_SIZE
        travel = wrapper.clientHeight
      }

      // Constant speed regardless of distance, so pulses crossing the full
      // page height don't look faster than short horizontal ones
      const speed = 450 + Math.random() * 450
      const duration = (travel + TRAIL_LENGTH) / speed

      const pulse = {
        id: nextId++,
        horizontal,
        reverse,
        cyan,
        duration,
        line,
        travel,
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
          style={{
            [p.horizontal ? 'top' : 'left']: `${p.line}px`,
            '--travel': `${p.travel}px`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

export default GridPulses

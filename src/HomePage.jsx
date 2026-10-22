import { useLayoutEffect } from 'react'
import css from './homepage.css?raw'
import markup from './homepage.html?raw'
import { mountHomepage } from './homepage.mount.js'

const DESCRIPTION = 'Third Origin is an independent engineering studio working at the frontier of decentralized systems.'

export default function HomePage() {
  useLayoutEffect(() => {
    const style = document.createElement('style')
    style.dataset.homepage = 'true'
    style.textContent = css
    document.head.appendChild(style)

    const previousTitle = document.title
    document.title = 'Third Origin | From genesis to frontier.'

    const description = document.querySelector('meta[name="description"]')
    const previousDescription = description?.getAttribute('content') ?? ''
    description?.setAttribute('content', DESCRIPTION)

    let theme = document.querySelector('meta[name="theme-color"]')
    const createdTheme = !theme
    if (!theme) {
      theme = document.createElement('meta')
      theme.setAttribute('name', 'theme-color')
      document.head.appendChild(theme)
    }
    const previousTheme = createdTheme ? null : theme.getAttribute('content')
    theme.setAttribute('content', '#101110')

    const stop = mountHomepage()

    return () => {
      stop()
      style.remove()
      document.title = previousTitle
      if (description) description.setAttribute('content', previousDescription)
      if (createdTheme) theme.remove()
      else if (previousTheme != null) theme.setAttribute('content', previousTheme)
    }
  }, [])

  return <div dangerouslySetInnerHTML={{ __html: markup }} />
}

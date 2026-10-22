import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import '../legal.css'

const LEGAL_DOCS = {
  'website-privacy': '/legal/website-privacy.json',
  'babel-privacy': '/legal/babel-privacy.json',
  'babel-terms': '/legal/babel-terms.json',
  'findash-privacy': '/legal/findash-privacy.json',
  'findash-terms': '/legal/findash-terms.json',
  'kshana-privacy': '/legal/kshana-privacy.json',
  'kshana-terms': '/legal/kshana-terms.json',
}

const PRODUCT_LABELS = {
  website: 'Website',
  babel: 'Babel',
  findash: 'FinDash',
  kshana: 'Kshana',
}

function Mark() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <rect x="50" y="40" width="100" height="22" rx="2" fill="#eb6332" />
      <polygon points="120,40 150,40 150,62 115,94 85,94 120,62" fill="#eb6332" />
      <path d="M45 115 L45 120 A55 55 0 0 0 155 120 L155 115 L133 115 L133 120 A33 33 0 0 1 67 120 L67 115 Z" fill="#eb6332" />
    </svg>
  )
}

function Mast() {
  return (
    <header className="legal-mast">
      <Link to="/" className="legal-identity" aria-label="Third Origin, home">
        <Mark />
        <span>Third Origin</span>
      </Link>
      <div className="legal-mast-right">
        <span className="legal-mini">Independent engineering studio</span>
        <a className="legal-write" href="mailto:info@thirdorigin.io">Get in touch ↗</a>
      </div>
    </header>
  )
}

function Foot({ app, doc }) {
  const sibling = doc === 'privacy' ? 'terms' : doc === 'terms' ? 'privacy' : null
  const siblingKey = sibling ? `${app || 'website'}-${sibling}` : null
  const siblingHref = siblingKey && LEGAL_DOCS[siblingKey]
    ? (app ? `/${app}/${sibling}` : `/${sibling}`)
    : null

  return (
    <footer className="legal-foot">
      <span>© 2026 Third Origin L.L.C-FZ</span>
      <span>Meydan Grandstand, Nad Al Sheba<br />Dubai, United Arab Emirates</span>
      <div className="legal-foot-links">
        <Link to="/">Home</Link>
        {siblingHref && <Link to={siblingHref}>{sibling === 'privacy' ? 'Privacy' : 'Terms'}</Link>}
      </div>
    </footer>
  )
}

function Paragraphs({ text }) {
  if (!text) return null
  return text.split(/\n\n+/).filter(Boolean).map((paragraph, index) => (
    <p key={index} className="legal-text">
      {paragraph.split('\n').map((line, lineIndex, lines) => (
        <span key={lineIndex}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  ))
}

function LegalPage() {
  const { app, doc } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const docKey = app ? `${app}-${doc}` : `website-${doc}`
  const jsonPath = LEGAL_DOCS[docKey]
  const product = PRODUCT_LABELS[app || 'website'] || 'Website'
  const kind = doc === 'terms' ? 'Terms' : 'Privacy'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [jsonPath])

  useEffect(() => {
    if (!data?.title) return undefined
    const previousTitle = document.title
    document.title = `${data.title} | Third Origin`
    return () => {
      document.title = previousTitle
    }
  }, [data])

  useEffect(() => {
    if (!jsonPath) {
      setError('Document not found')
      setLoading(false)
      setData(null)
      return undefined
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(jsonPath)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load document')
        return res.json()
      })
      .then(json => {
        if (cancelled) return
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message)
        setData(null)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [jsonPath])

  return (
    <div className="legal-page">
      <Mast />
      <main className="legal-main">
        <Link to="/" className="legal-back">← Back</Link>
        <p className="legal-eyebrow"><i />{product} / {kind}</p>
        {loading && (
          <div className="legal-status">
            <h1>Loading.</h1>
          </div>
        )}
        {!loading && (error || !data) && (
          <div className="legal-status">
            <h1>This page is unavailable.</h1>
            <p>{error || 'Document not found'}</p>
          </div>
        )}
        {!loading && data && (
          <>
            <h1>{data.title}</h1>
            {data.effectiveDate && <p className="legal-date">Effective {data.effectiveDate}</p>}
            <div className="legal-sections">
              {data.sections.map((section, index) => (
                <section key={index} className={section.is_disclaimer ? 'legal-section legal-disclaimer' : 'legal-section'}>
                  {section.title && <h2>{section.title}</h2>}
                  <Paragraphs text={section.content} />
                  {section.subsections?.map((subsection, subsectionIndex) => (
                    <div key={subsectionIndex} className="legal-subsection">
                      {subsection.title && <h3>{subsection.title}</h3>}
                      <Paragraphs text={subsection.content} />
                    </div>
                  ))}
                  {section.contact && (
                    <div>
                      <p className="legal-text legal-company">{section.contact.company}</p>
                      <a className="legal-email" href={`mailto:${section.contact.email}`}>{section.contact.email}</a>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </>
        )}
      </main>
      <Foot app={app} doc={doc} />
    </div>
  )
}

export default LegalPage

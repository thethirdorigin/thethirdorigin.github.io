import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

// Map route params to JSON file paths
const LEGAL_DOCS = {
  'website-privacy': '/legal/website-privacy.json',
  'babel-privacy': '/legal/babel-privacy.json',
  'babel-terms': '/legal/babel-terms.json',
  'findash-privacy': '/legal/findash-privacy.json',
  'findash-terms': '/legal/findash-terms.json',
  'kshana-privacy': '/legal/kshana-privacy.json',
  'kshana-terms': '/legal/kshana-terms.json',
}

function LegalPage() {
  const { app, doc } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Construct the doc key from route params
  const docKey = app ? `${app}-${doc}` : `website-${doc}`
  const jsonPath = LEGAL_DOCS[docKey]

  useEffect(() => {
    if (!jsonPath) {
      setError('Document not found')
      setLoading(false)
      return
    }

    fetch(jsonPath)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load document')
        return res.json()
      })
      .then(json => {
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [jsonPath])

  const renderContent = (content) => {
    if (!content) return null
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  const renderSubsection = (subsection, index) => (
    <div key={index} className="legal-subsection">
      {subsection.title && <h4 className="legal-subsection-title">{subsection.title}</h4>}
      <p className="legal-text">{renderContent(subsection.content)}</p>
    </div>
  )

  const renderSection = (section, index) => (
    <div key={index} className={`legal-section ${section.is_disclaimer ? 'legal-disclaimer' : ''}`}>
      {section.title && <h3 className="legal-section-title">{section.title}</h3>}
      {section.content && <p className="legal-text">{renderContent(section.content)}</p>}
      {section.subsections && section.subsections.map(renderSubsection)}
      {section.contact && (
        <div className="legal-contact">
          <p className="legal-text">{section.contact.company}</p>
          <a href={`mailto:${section.contact.email}`} className="legal-email">
            {section.contact.email}
          </a>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="legal-container">
        <div className="legal-content">
          <div className="legal-loading">
            <div className="legal-loading-spinner"></div>
            <p>Loading document...</p>
          </div>
        </div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="legal-container">
        <div className="legal-content">
          <Link to="/" className="legal-back">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            Back to Home
          </Link>
          <div className="legal-error">
            <h2>Unable to load document</h2>
            <p>{error || 'Document not found'}</p>
          </div>
        </div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
      </div>
    )
  }

  return (
    <div className="legal-container">
      <div className="legal-content">
        <Link to="/" className="legal-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          Back to Home
        </Link>
        
        <h1 className="legal-title">{data.title}</h1>
        {data.effectiveDate && (
          <p className="legal-effective-date">Effective Date: {data.effectiveDate}</p>
        )}
        
        <div className="legal-sections">
          {data.sections.map(renderSection)}
        </div>
        
        <div className="legal-footer">
          <Link to="/" className="legal-back-bottom">
            Return to Third Origin
          </Link>
        </div>
      </div>
      
      {/* Background gradient orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
    </div>
  )
}

export default LegalPage

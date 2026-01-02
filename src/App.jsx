import logo from './assets/logo.svg'

function App() {
  return (
    <div className="container">
      <div className="content">
        {/* Logo */}
        <div className="logo-wrapper fade-in" style={{ animationDelay: '0s' }}>
          <img src={logo} alt="Third Origin Logo" className="logo" />
        </div>

        {/* Company Name */}
        <h1 className="company-name fade-in" style={{ animationDelay: '0.1s' }}>
          Third Origin
        </h1>

        {/* Tagline */}
        <p className="tagline fade-in" style={{ animationDelay: '0.2s' }}>
          From Genesis to Frontier
        </p>

        {/* Divider */}
        <div className="divider fade-in" style={{ animationDelay: '0.3s' }}></div>

        {/* Description */}
        <p className="description fade-in" style={{ animationDelay: '0.4s' }}>
          We architect digital experiences across the full spectrum. From sleek 
          web applications to decentralized protocols. Whether you're scaling a 
          startup or pioneering the next blockchain breakthrough, we turn ambitious 
          ideas into production-ready reality.
        </p>

        {/* Services */}
        {/* <div className="services fade-in" style={{ animationDelay: '0.5s' }}>
          <span className="service-tag">Consulting</span>
          <span className="service-tag">Full Stack Development</span>
          <span className="service-tag">Web2</span>
          <span className="service-tag">Web3</span>
        </div> */}

        {/* Contact Info */}
        <div className="contact fade-in" style={{ animationDelay: '0.6s' }}>
          <a href="mailto:info@thirdorigin.io" className="contact-item email">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            info@thirdorigin.io
          </a>
          <div className="contact-item address">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Meydan Grandstand, 6th floor, Meydan Road, Nad Al Sheba, Dubai, U.A.E.
          </div>
        </div>

        {/* Legal Name */}
        <p className="legal-name fade-in" style={{ animationDelay: '0.7s' }}>
          Third Origin L.L.C-FZ
        </p>
      </div>

      {/* Background gradient orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
    </div>
  )
}

export default App


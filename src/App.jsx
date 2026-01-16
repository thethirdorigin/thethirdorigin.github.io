import { Link } from 'react-router-dom'
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

        {/* Our Apps Section */}
        <div className="apps-section fade-in" style={{ animationDelay: '0.5s' }}>
          <h2 className="section-title">Our Apps</h2>
          <div className="apps-grid">
            {/* Babel Card */}
            <div className="app-card">
              <div className="app-card-header">
                <div className="app-icon babel-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/>
                    <path d="M12 8v8"/>
                    <path d="M8 12h8"/>
                  </svg>
                </div>
                <span className="coming-soon-badge">Coming Soon</span>
              </div>
              <h3 className="app-name">Babel</h3>
              <p className="app-description">
                Pregnancy safety scanner. Scan products and ingredients to get 
                AI-powered safety guidance tailored to your trimester.
              </p>
              <div className="app-links">
                <Link to="/babel/privacy" className="app-link">Privacy Policy</Link>
                <span className="app-link-divider">·</span>
                <Link to="/babel/terms" className="app-link">Terms of Service</Link>
              </div>
            </div>

            {/* Findash Card */}
            <div className="app-card">
              <div className="app-card-header">
                <div className="app-icon findash-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"/>
                    <path d="m19 9-5 5-4-4-3 3"/>
                  </svg>
                </div>
                <span className="coming-soon-badge">Coming Soon</span>
              </div>
              <h3 className="app-name">Findash</h3>
              <p className="app-description">
                YNAB financial dashboard. Visualize spending trends, track budgets, 
                and get AI-powered insights into your finances.
              </p>
              <div className="app-links">
                <Link to="/findash/privacy" className="app-link">Privacy Policy</Link>
                <span className="app-link-divider">·</span>
                <Link to="/findash/terms" className="app-link">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="contact-section fade-in" style={{ animationDelay: '0.6s' }}>
          <h2 className="section-title">Contact</h2>
          <div className="contact-card">
            <div className="contact-card-inner">
              {/* Company Info */}
              <div className="contact-company">
                <div className="contact-company-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                    <path d="M10 6h4"/>
                    <path d="M10 10h4"/>
                    <path d="M10 14h4"/>
                    <path d="M10 18h4"/>
                  </svg>
                </div>
                <div className="contact-company-details">
                  <span className="contact-label">Company</span>
                  <span className="contact-value company-value">Third Origin L.L.C-FZ</span>
                </div>
              </div>

              {/* Email */}
              <a href="mailto:info@thirdorigin.io" className="contact-row">
                <div className="contact-row-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <div className="contact-row-details">
                  <span className="contact-label">Email</span>
                  <span className="contact-value">info@thirdorigin.io</span>
                </div>
              </a>

              {/* Address */}
              <div className="contact-row">
                <div className="contact-row-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="contact-row-details">
                  <span className="contact-label">Address</span>
                  <span className="contact-value address-value">
                    Meydan Grandstand, 6th floor<br />
                    Meydan Road, Nad Al Sheba<br />
                    Dubai, U.A.E.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="footer-links">
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          </div>
          <p className="copyright">© {new Date().getFullYear()} Third Origin L.L.C-FZ</p>
        </footer>
      </div>

      {/* Background gradient orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
    </div>
  )
}

export default App

import { Link } from 'react-router-dom'
import logo from './assets/logo.svg'

function App() {
  return (
    <div className="container">
      <div className="content">
        {/* Hero */}
        <div className="logo-wrapper fade-in" style={{ animationDelay: '0s' }}>
          <img src={logo} alt="Third Origin Logo" className="logo" />
        </div>

        <h1 className="company-name fade-in" style={{ animationDelay: '0.1s' }}>
          Third Origin
        </h1>

        <p className="tagline fade-in" style={{ animationDelay: '0.2s' }}>
          From Genesis to Frontier
        </p>

        <div className="divider fade-in" style={{ animationDelay: '0.3s' }}></div>

        {/* Intro */}
        <div className="intro-section fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="section-label">
            <span className="label-prefix">// </span>WHO_WE_ARE
          </p>
          <div className="intro-grid">
            <div className="intro-block">
              <span className="intro-keyword">the &ldquo;third&rdquo;</span>
              <p className="intro-text">
                The web evolved in waves. <strong>Read. Read-write. Read-write-own.</strong> We 
                build across all three, from classic web applications to decentralized 
                protocols and on-chain infrastructure.
              </p>
            </div>
            <div className="intro-block">
              <span className="intro-keyword">the &ldquo;origin&rdquo;</span>
              <p className="intro-text">
                Every lasting system starts with a strong foundation. We architect 
                the <strong>bedrock</strong>, initial designs, core infrastructure, and 
                production-ready MVPs that teams scale upon.
              </p>
            </div>
            <div className="intro-block">
              <span className="intro-keyword">consultancy</span>
              <p className="intro-text">
                Not just advice, we <strong>ship</strong>. From concept through architecture 
                to working code. Startups, protocols, and enterprises trust us to turn ambitious 
                ideas into deployed reality.
              </p>
            </div>
            <div className="intro-block">
              <span className="intro-keyword">frontier</span>
              <p className="intro-text">
                We operate at the edge of what's technically possible. <strong>Blockchain 
                monitoring, cross-chain intent solving, transaction relaying</strong>, building 
                the tooling the next wave depends on.
              </p>
            </div>
          </div>
        </div>

        {/* Open Source Portfolio */}
        <div className="portfolio-section fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="section-label">
            <span className="label-prefix">// </span>OPEN_SOURCE
          </p>
          <div className="portfolio-grid">
            {/* OpenZeppelin Monitor */}
            <div className="portfolio-card">
              <div className="portfolio-card-header">
                <span className="portfolio-org">OpenZeppelin</span>
                <span className="role-badge architect">Architect</span>
              </div>
              <h3 className="portfolio-name">Monitor</h3>
              <p className="portfolio-description">
                Blockchain monitoring service for on-chain activity detection. 
                Designed the initial architecture and built the MVP. Multi-chain 
                support for EVM, Stellar, and Solana with configurable triggers.
              </p>
              <div className="portfolio-footer">
                <div className="portfolio-tags">
                  <span className="tech-tag">Rust</span>
                  <span className="tech-tag">Multi-chain</span>
                </div>
                <a
                  href="https://github.com/OpenZeppelin/openzeppelin-monitor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                    <path d="M9 18c-4.51 2-5-2-7-2"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>

            {/* OIF Solver */}
            <div className="portfolio-card">
              <div className="portfolio-card-header">
                <span className="portfolio-org">Open Intents Framework</span>
                <span className="role-badge architect">Architect</span>
              </div>
              <h3 className="portfolio-name">OIF Solver</h3>
              <p className="portfolio-description">
                Cross-chain intent solver. Architected the modular workspace, 
                discovery-to-settlement pipeline, and multi-chain execution 
                engine for efficient order filling.
              </p>
              <div className="portfolio-footer">
                <div className="portfolio-tags">
                  <span className="tech-tag">Rust</span>
                  <span className="tech-tag">Cross-chain</span>
                </div>
                <a
                  href="https://github.com/openintentsframework/oif-solver"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                    <path d="M9 18c-4.51 2-5-2-7-2"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>

            {/* OpenZeppelin Relayer */}
            <div className="portfolio-card">
              <div className="portfolio-card-header">
                <span className="portfolio-org">OpenZeppelin</span>
                <span className="role-badge contributor">Contributor</span>
              </div>
              <h3 className="portfolio-name">Relayer</h3>
              <p className="portfolio-description">
                Multi-chain transaction relayer with gasless transaction support. 
                Contributed to the Solana, EVM, and Stellar integration layers 
                and signing infrastructure.
              </p>
              <div className="portfolio-footer">
                <div className="portfolio-tags">
                  <span className="tech-tag">Rust</span>
                  <span className="tech-tag">Gasless</span>
                </div>
                <a
                  href="https://github.com/OpenZeppelin/openzeppelin-relayer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                    <path d="M9 18c-4.51 2-5-2-7-2"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Our Apps */}
        <div className="apps-section fade-in" style={{ animationDelay: '0.6s' }}>
          <p className="section-label">
            <span className="label-prefix">// </span>OUR_APPS
          </p>
          <div className="apps-grid">
            {/* Babel */}
            <div className="app-card">
              <div className="app-card-header">
                <div className="app-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/>
                    <path d="M12 8v8"/>
                    <path d="M8 12h8"/>
                  </svg>
                </div>
                <span className="beta-badge">Beta</span>
              </div>
              <h3 className="app-name">Babel</h3>
              <p className="app-description">
                Pregnancy safety scanner. Scan products and ingredients to get 
                AI-powered safety guidance tailored to your trimester.
              </p>
              <a 
                href="https://apps.apple.com/app/babelscan/id6758505599" 
                target="_blank" 
                rel="noopener noreferrer"
                className="app-store-button"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                App Store
              </a>
              <div className="app-links">
                <Link to="/babel/privacy" className="app-link">Privacy</Link>
                <span className="app-link-divider">&middot;</span>
                <Link to="/babel/terms" className="app-link">Terms</Link>
              </div>
            </div>

            {/* Findash */}
            <div className="app-card">
              <div className="app-card-header">
                <div className="app-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"/>
                    <path d="m19 9-5 5-4-4-3 3"/>
                  </svg>
                </div>
                <span className="beta-badge">Beta</span>
              </div>
              <h3 className="app-name">Findash</h3>
              <p className="app-description">
                YNAB financial dashboard. Visualize spending trends, track budgets, 
                and get AI-powered insights into your finances.
              </p>
              <a 
                href="https://findash.thirdorigin.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="web-app-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Web App
              </a>
              <div className="app-links">
                <Link to="/findash/privacy" className="app-link">Privacy</Link>
                <span className="app-link-divider">&middot;</span>
                <Link to="/findash/terms" className="app-link">Terms</Link>
              </div>
            </div>

            {/* Kshana */}
            <div className="app-card">
              <div className="app-card-header">
                <div className="app-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a7 7 0 0 0 0 20"/>
                    <path d="M12 2a7 7 0 0 1 0 20"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <span className="beta-badge">Beta</span>
              </div>
              <h3 className="app-name">Kshana</h3>
              <p className="app-description">
                Vedic panchang calculator. Explore daily tithis, nakshatras, and 
                muhurtas with a travel planner for disha shool guidance.
              </p>
              <a 
                href="https://kshana.thirdorigin.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="web-app-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Web App
              </a>
              <div className="app-links">
                <Link to="/kshana/privacy" className="app-link">Privacy</Link>
                <span className="app-link-divider">&middot;</span>
                <Link to="/kshana/terms" className="app-link">Terms</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="footer-top">
            <div className="footer-col">
              <span className="footer-col-label">Third Origin L.L.C-FZ</span>
              <span className="footer-address">
                Meydan Grandstand, 6th floor<br />
                Meydan Road, Nad Al Sheba<br />
                Dubai, U.A.E.
              </span>
            </div>
            <div className="footer-col">
              <span className="footer-col-label">Contact</span>
              <a href="mailto:info@thirdorigin.io" className="footer-contact-link">info@thirdorigin.io</a>
            </div>
            <div className="footer-col">
              <span className="footer-col-label">Legal</span>
              <Link to="/privacy" className="footer-contact-link">Privacy Policy</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="copyright">&copy; {new Date().getFullYear()} Third Origin L.L.C-FZ</p>
          </div>
        </footer>
      </div>

      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
    </div>
  )
}

export default App

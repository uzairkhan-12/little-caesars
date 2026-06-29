const SUPPORT_EMAIL = "info@primewave.ai";

export function PrimewaveFooter() {
  return (
    <footer className="primewave-footer">
      <div className="primewave-footer__stack">
        <div className="primewave-footer__inner">
          <span className="primewave-footer__label">Powered by</span>
          <span className="primewave-footer__brand" aria-label="PrimeWave AI Solutions">
            <span className="primewave-footer__name">
              <span className="primewave-footer__prime">PRIME</span>WAVE
            </span>
            <span className="primewave-footer__tagline">AI Solutions</span>
          </span>
        </div>

        <p className="primewave-footer__support">
          <span className="primewave-footer__support-label">Support & info</span>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="primewave-footer__email">
            {SUPPORT_EMAIL}
          </a>
        </p>
      </div>
    </footer>
  );
}

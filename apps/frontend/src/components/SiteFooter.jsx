function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.2c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.7.8-.1.1-.2.1-.4 0a6.7 6.7 0 0 1-2-1.2 7.3 7.3 0 0 1-1.4-1.7c-.1-.2 0-.3.1-.4l.3-.3.2-.4c.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.3-.4-.5-.4h-.4a.8.8 0 0 0-.6.3c-.2.2-.8.8-.8 2s.8 2.4.9 2.6c.1.2 1.7 2.7 4.2 3.7 2.5 1 2.5.7 3 .7.4 0 1.2-.5 1.4-1 .2-.5.2-1 .2-1 0-.1-.1-.2-.3-.3Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.3v2.4H8v3.2h2.7V22h2.8Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm6.4-8.4a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0ZM22 7c0-2.8-2.2-5-5-5H7C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7Zm-1.8 10c0 1.8-1.4 3.2-3.2 3.2H7A3.2 3.2 0 0 1 3.8 17V7C3.8 5.2 5.2 3.8 7 3.8h10c1.8 0 3.2 1.4 3.2 3.2v10Z" />
    </svg>
  )
}

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__copyright">
          © {year} Sahara Kids. All rights reserved.
        </p>

        <nav className="site-footer__links" aria-label="Enlaces legales">
          <a href="#">Terminos y Condiciones</a>
          <a href="#">Aviso de Privacidad</a>
          <a href="#">Uso de Informacion Personal</a>
          <a href="#">Politica de Promociones</a>
          <a href="#">Sitios Internacionales</a>
          <a href="#">Mapa del Sitio</a>
        </nav>

        <div className="site-footer__social" aria-label="Redes sociales">
          <a href="#" aria-label="WhatsApp"><WhatsAppIcon /></a>
          <a href="#" aria-label="Facebook"><FacebookIcon /></a>
          <a href="#" aria-label="Instagram"><InstagramIcon /></a>
        </div>
      </div>
    </footer>
  )
}

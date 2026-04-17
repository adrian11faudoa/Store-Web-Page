import { Link } from 'react-router-dom'
import { t, useLang } from '../store/lang.js'

function SocialIcon({ name }) {
  switch (name) {
    case 'WhatsApp':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 11.9a8 8 0 0 1-11.7 7l-4.3 1.1 1.1-4.1A8 8 0 1 1 20 11.9Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 8.9c-.2-.4-.4-.4-.6-.4h-.4c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.3 1 2.5c.1.1 1.6 2.6 4 3.5.6.3 1.1.4 1.5.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.3.1-.5l.4-.5c.1-.1.2-.2.2-.4.1-.1 0-.3 0-.4l-.4-1.1Z" fill="currentColor" />
        </svg>
      )
    case 'Instagram':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="17.3" cy="6.8" r="1.2" fill="currentColor" />
        </svg>
      )
    case 'Facebook':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13.5 20v-6h2.3l.3-2.6h-2.6V9.8c0-.8.2-1.3 1.4-1.3H16V6.2c-.4-.1-1-.2-1.8-.2-2.2 0-3.7 1.3-3.7 3.8v1.6H8.3V14h2.2v6h3Z" fill="currentColor" />
        </svg>
      )
    case 'X':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.5 5h3.4l3.4 4.8L16.6 5H19l-5.5 6.2L19.5 19H16l-3.8-5.2L7.4 19H5l5.8-6.5L5.5 5Z" fill="currentColor" />
        </svg>
      )
    case 'Pinterest':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4.8c-4.3 0-6.5 3.1-6.5 5.8 0 1.6.6 3 1.8 3.6.2.1.3 0 .4-.2l.4-1.4c.1-.2 0-.3-.1-.5-.3-.4-.5-.9-.5-1.7 0-2.2 1.7-4.3 4.4-4.3 2.4 0 3.8 1.5 3.8 3.4 0 2.6-1.2 4.8-2.9 4.8-.9 0-1.6-.8-1.4-1.8.3-1.1.8-2.3.8-3.1 0-.7-.4-1.4-1.2-1.4-1 0-1.8 1-1.8 2.4 0 .9.3 1.5.3 1.5l-1.2 5.1c-.2.8 0 1.9.1 2.5.1.1.1.1.2 0 .1-.2.8-1 1-1.9l.6-2.3c.3.6 1.3 1.2 2.4 1.2 3.1 0 5.3-2.9 5.3-6.8 0-2.9-2.5-5.6-6.3-5.6Z" fill="currentColor" />
        </svg>
      )
    default:
      return null
  }
}

const SOCIAL_LINKS = [
  { name: 'WhatsApp', href: 'https://wa.me/' },
  { name: 'Instagram', href: 'https://instagram.com/' },
  { name: 'Facebook', href: 'https://facebook.com/' },
  { name: 'X', href: 'https://x.com/' },
  { name: 'Pinterest', href: 'https://pinterest.com/' },
]

export default function Footer() {
  const lang = useLang(state => state.lang)

  const footerSections = [
    {
      title: t(lang, 'shopping'),
      links: [
        { label: t(lang, 'newIn'), to: '/shop?badge=new' },
        { label: t(lang, 'boys'), to: '/shop?ageGroup=boys&gender=boy' },
        { label: t(lang, 'girls'), to: '/shop?ageGroup=girls&gender=girl' },
        { label: t(lang, 'baby'), to: '/shop?ageGroup=baby' },
        { label: t(lang, 'sale'), to: '/shop?badge=sale' },
      ],
    },
    {
      title: t(lang, 'customerService'),
      links: [
        { label: t(lang, 'sizeGuide'), href: '#' },
        { label: t(lang, 'returns'), href: '#' },
        { label: t(lang, 'deliveryInfo'), href: '#' },
        { label: t(lang, 'trackOrder'), href: '#' },
        { label: t(lang, 'faqs'), href: '#' },
      ],
    },
    {
      title: t(lang, 'corporate'),
      links: [
        { label: t(lang, 'ourStory'), href: '#' },
        { label: t(lang, 'sustainability'), href: '#' },
        { label: t(lang, 'press'), href: '#' },
        { label: t(lang, 'careers'), href: '#' },
        { label: t(lang, 'contact'), href: '#' },
      ],
    },
    {
      title: t(lang, 'policies'),
      links: [
        { label: t(lang, 'privacy'), href: '#' },
        { label: t(lang, 'terms'), href: '#' },
        { label: t(lang, 'cookies'), href: '#' },
      ],
    },
  ]

  return (
    <footer className="footer">
      <div className="footer__info">
        <div className="footer__accordion">
          {footerSections.map(({ title, links }) => (
            <details key={title} className="footer__section">
              <summary className="footer__summary">
                <span>{title}</span>
                <span className="footer__chevron" aria-hidden="true">⌄</span>
              </summary>
              <div className="footer__panel">
                <ul className="footer__links">
                  {links.map(link => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link to={link.to}>{link.label}</Link>
                      ) : (
                        <a href={link.href}>{link.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="footer__top">
        <div className="footer__brand-logo">Sahara<span>Kids</span></div>
        <p className="footer__tagline">{t(lang, 'footerTagline')}</p>
        <div className="footer__social">
          {SOCIAL_LINKS.map(({ name, href }) => (
            <a
              key={name}
              className="footer__social-btn"
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={name}
              title={name}
            >
              <SocialIcon name={name} />
            </a>
          ))}
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">© 2026 Sahara Kids Ltd. {t(lang, 'allRightsReserved')}</p>
        <div className="footer__legal">
          <a href="#">{t(lang, 'privacy')}</a>
          <a href="#">{t(lang, 'terms')}</a>
          <a href="#">{t(lang, 'cookies')}</a>
        </div>
      </div>
    </footer>
  )
}

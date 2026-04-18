export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h2>Sahara Kids</h2>
          <p>
            A portfolio-ready storefront demo focused on clean design, scalable
            frontend architecture, and a polished shopping experience.
          </p>
        </div>
        <div>
          <h3>Highlights</h3>
          <ul>
            <li>Dynamic catalog from JSON data</li>
            <li>Persistent cart with totals</li>
            <li>Accessible, mobile-first UI</li>
          </ul>
        </div>
        <div>
          <h3>Deployment</h3>
          <ul>
            <li>Vite production build</li>
            <li>Relative asset paths</li>
            <li>GitHub Pages friendly routing</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

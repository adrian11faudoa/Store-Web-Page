import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h2 className="footer-brand__name">Sahara Kids</h2>
          <p className="footer-brand__tagline">Little style, big smiles.</p>
          <p>Soft, playful clothing for babies, toddlers, and kids up to 16 years.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <ul>
            <li><Link to="/shop?gender=girls">Girls</Link></li>
            <li><Link to="/shop?gender=boys">Boys</Link></li>
            <li><Link to="/shop?q=baby">Baby</Link></li>
            <li><Link to="/shop?badge=new">New arrivals</Link></li>
            <li><Link to="/shop?badge=featured">Featured</Link></li>
          </ul>
        </div>
        <div>
          <h3>Help</h3>
          <ul>
            <li><a href="#">Size guide</a></li>
            <li><a href="#">Shipping &amp; returns</a></li>
            <li><a href="#">Contact us</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Sahara Kids. All rights reserved.</p>
          <p>Made with ❤️ for little ones everywhere.</p>
        </div>
      </div>
    </footer>
  )
}

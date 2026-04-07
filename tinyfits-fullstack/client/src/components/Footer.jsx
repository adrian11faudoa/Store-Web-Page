// client/src/components/Footer.jsx
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <div className="footer__brand-logo">tiny<span>.</span>fits</div>
          <p className="footer__tagline">Clothes kids love,<br />prices parents don't hate.</p>
          <div className="footer__social">
            {['📸','🐦','📌','▶️'].map(icon => (
              <button key={icon} className="social-btn">{icon}</button>
            ))}
          </div>
        </div>
        <div className="footer__col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop?badge=new">New in</Link></li>
            <li><Link to="/shop?category=tops">Boys</Link></li>
            <li><Link to="/shop?category=dresses">Girls</Link></li>
            <li><Link to="/shop?ageGroup=baby">Baby</Link></li>
            <li><Link to="/shop?badge=sale">Sale</Link></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Help</h4>
          <ul>
            {['Size guide','Returns','Delivery info','Track order','FAQs'].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer__col">
          <h4>About</h4>
          <ul>
            {['Our story','Sustainability','Press','Careers','Contact'].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <p className="footer__copy">© 2026 tiny.fits Ltd. All rights reserved.</p>
        <div className="footer__legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  )
}

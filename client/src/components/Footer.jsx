// client/src/components/Footer.jsx
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <div className="footer__brand-logo">Sahara<span>Kids</span></div>
          <p className="footer__tagline">Moda infantil que los niños aman,<br />a precios que los padres adoran.</p>
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
            <li><Link to="/shop?ageGroup=boys&gender=boy">Boys</Link></li>
            <li><Link to="/shop?ageGroup=girls&gender=girl">Girls</Link></li>
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
        <p className="footer__copy">© 2026 Sahara Kids Ltd. All rights reserved.</p>
        <div className="footer__legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  )
}

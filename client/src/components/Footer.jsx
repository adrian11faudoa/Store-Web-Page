import { Link } from 'react-router-dom'
import { useLocale } from '../locale/LocaleProvider.jsx'

export default function Footer() {
  const { t } = useLocale()

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h2 className="footer-brand__name">Sahara Kids</h2>
          <p className="footer-brand__tagline">{t('footerTagline')}</p>
          <p>{t('footerCopy')}</p>
        </div>
        <div>
          <h3>{t('footerShop')}</h3>
          <ul>
            <li><Link to="/shop?gender=girls">{t('footerGirls')}</Link></li>
            <li><Link to="/shop?gender=boys">{t('footerBoys')}</Link></li>
            <li><Link to="/shop?q=baby">{t('footerBaby')}</Link></li>
            <li><Link to="/shop?badge=new">{t('footerNewArrivals')}</Link></li>
            <li><Link to="/shop?badge=featured">{t('footerFeatured')}</Link></li>
          </ul>
        </div>
        <div>
          <h3>{t('footerHelp')}</h3>
          <ul>
            <li><a href="#">{t('footerSizeGuide')}</a></li>
            <li><a href="#">{t('footerShippingReturns')}</a></li>
            <li><a href="#">{t('footerContact')}</a></li>
            <li><a href="#">{t('footerFaq')}</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Sahara Kids. {t('footerRights')}</p>
          <p>{t('footerMadeWithLove')}</p>
        </div>
      </div>
    </footer>
  )
}

import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-50 border-t minimal-border mt-20" data-testid="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-light tracking-wide text-primary mb-2" data-testid="text-footer-brand">
                {t('footer.brand')}
              </h3>
              <p className="text-gray-600 font-light leading-relaxed max-w-md" data-testid="text-footer-description">
                {t('footer.description')}
              </p>
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="hover:scale-110 transition-transform" 
                data-testid="link-footer-facebook"
              >
                <SiFacebook className="h-6 w-6 text-blue-600 hover:text-blue-700" />
              </a>
              <a 
                href="#" 
                className="hover:scale-110 transition-transform" 
                data-testid="link-footer-instagram"
              >
                <SiInstagram className="h-6 w-6 text-pink-600 hover:text-pink-700" />
              </a>
              <a 
                href="#" 
                className="hover:scale-110 transition-transform" 
                data-testid="link-footer-x"
              >
                <SiX className="h-6 w-6 text-black hover:text-gray-800" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase mb-4" data-testid="text-quick-links">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3 font-light">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-about">
                  {t('nav.about')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-products">
                  {t('nav.products')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-contact">
                  {t('nav.contact')}
                </a>
              </li>
              <li>
                <a href="/admin" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-footer-admin">
                  {t('header.admin')}
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase mb-4" data-testid="text-customer-service">
              {t('footer.customerService')}
            </h4>
            <ul className="space-y-3 font-light">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-shipping">
                  {t('footer.shipping')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-returns">
                  {t('footer.returns')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-faq">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-support">
                  {t('footer.support')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 font-light text-sm" data-testid="text-copyright">
              {t('footer.copyright')}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm font-light" data-testid="link-privacy">
                {t('footer.privacy')}
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm font-light" data-testid="link-terms">
                {t('footer.terms')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
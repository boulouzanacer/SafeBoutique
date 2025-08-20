import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import { useTranslation } from 'react-i18next';
import AnimatedText from "@/components/animated-text";
import LanguageTransition from "@/components/language-transition";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-50 border-t minimal-border mt-20" data-testid="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LanguageTransition>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-light tracking-wide text-primary mb-2" data-testid="text-footer-brand">
                <AnimatedText translationKey="footer.brand" className="inline-block" />
              </h3>
              <p className="text-gray-600 font-light leading-relaxed max-w-md" data-testid="text-footer-description">
                <AnimatedText translationKey="footer.description" className="inline-block" />
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
              <AnimatedText translationKey="footer.quickLinks" className="inline-block" />
            </h4>
            <ul className="space-y-3 font-light">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-about">
                  <AnimatedText translationKey="footer.about" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-products">
                  <AnimatedText translationKey="footer.products" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-contact">
                  <AnimatedText translationKey="footer.contact" />
                </a>
              </li>
              <li>
                <a href="/admin" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-footer-admin">
                  <AnimatedText translationKey="footer.admin" />
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase mb-4" data-testid="text-customer-service">
              <AnimatedText translationKey="footer.customerService" className="inline-block" />
            </h4>
            <ul className="space-y-3 font-light">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-shipping">
                  <AnimatedText translationKey="footer.shipping" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-returns">
                  <AnimatedText translationKey="footer.returns" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-faq">
                  <AnimatedText translationKey="footer.faq" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-support">
                  <AnimatedText translationKey="footer.support" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 font-light text-sm" data-testid="text-copyright">
              <AnimatedText translationKey="footer.copyright" />
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm font-light" data-testid="link-privacy">
                <AnimatedText translationKey="footer.privacy" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm font-light" data-testid="link-terms">
                <AnimatedText translationKey="footer.terms" />
              </a>
            </div>
          </div>
        </div>
        </LanguageTransition>
      </div>
    </footer>
  );
}
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import { useTranslation } from 'react-i18next';
import AnimatedText from "@/components/animated-text";
import LanguageTransition from "@/components/language-transition";
import { useQuery } from "@tanstack/react-query";
import { SiteSettings } from "@shared/schema";

export default function Footer() {
  const { t } = useTranslation();
  
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });
  
  return (
    <footer className="bg-gray-50 border-t minimal-border mt-20" data-testid="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LanguageTransition>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-light tracking-wide text-primary mb-2" data-testid="text-footer-brand">
                {settings?.siteName || "SafeSoft Boutique"}
              </h3>
              <p className="text-gray-600 font-light leading-relaxed max-w-md" data-testid="text-footer-description">
                {settings?.siteDescription || "Premium quality products with excellent service"}
              </p>
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              {settings?.socialFacebook && (
                <a 
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform" 
                  data-testid="link-footer-facebook"
                >
                  <SiFacebook className="h-6 w-6 text-blue-600 hover:text-blue-700" />
                </a>
              )}
              {settings?.socialInstagram && (
                <a 
                  href={settings.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform" 
                  data-testid="link-footer-instagram"
                >
                  <SiInstagram className="h-6 w-6 text-pink-600 hover:text-pink-700" />
                </a>
              )}
              {settings?.socialTwitter && (
                <a 
                  href={settings.socialTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform" 
                  data-testid="link-footer-x"
                >
                  <SiX className="h-6 w-6 text-black hover:text-gray-800" />
                </a>
              )}
            </div>
          </div>

          {/* Contact Nous */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase mb-4" data-testid="text-contact-us">
              <AnimatedText translationKey="footer.contact" className="inline-block" />
            </h4>
            <ul className="space-y-3 font-light">
              <li>
                <a href="/contact" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-contact">
                  Contact Nous
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase mb-4" data-testid="text-contact-info">
              Contact Info
            </h4>
            <div className="space-y-3 font-light text-gray-600">
              {settings?.contactPhone && (
                <div className="flex items-center space-x-2" data-testid="contact-phone">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm">{settings.contactPhone}</span>
                </div>
              )}
              {settings?.contactEmail && (
                <div className="flex items-center space-x-2" data-testid="contact-email">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{settings.contactEmail}</span>
                </div>
              )}
              {settings?.contactAddress && (
                <div className="flex items-start space-x-2" data-testid="contact-address">
                  <svg className="h-4 w-4 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm leading-relaxed">{settings.contactAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 font-light text-sm" data-testid="text-copyright">
              {settings?.footerText || "© 2024 SafeSoft Boutique. All rights reserved."}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy-policy" className="text-gray-500 hover:text-primary transition-colors text-sm font-light" data-testid="link-privacy">
                <AnimatedText translationKey="footer.privacy" />
              </a>
              <a href="/terms-of-service" className="text-gray-500 hover:text-primary transition-colors text-sm font-light" data-testid="link-terms">
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
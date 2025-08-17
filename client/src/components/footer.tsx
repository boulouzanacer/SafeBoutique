import { SiFacebook, SiInstagram, SiX } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t minimal-border mt-20" data-testid="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-light tracking-wide text-primary mb-2" data-testid="text-footer-brand">
                SafeSoft Boutique
              </h3>
              <p className="text-gray-600 font-light leading-relaxed max-w-md" data-testid="text-footer-description">
                Your premier destination for professional software solutions and premium products. 
                We specialize in delivering quality and elegance in every purchase.
              </p>
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary transition-colors" 
                data-testid="link-footer-facebook"
              >
                <SiFacebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary transition-colors" 
                data-testid="link-footer-instagram"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary transition-colors" 
                data-testid="link-footer-x"
              >
                <SiX className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase mb-4" data-testid="text-quick-links">
              Quick Links
            </h4>
            <ul className="space-y-3 font-light">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-about">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-products">
                  Products
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-contact">
                  Contact
                </a>
              </li>
              <li>
                <a href="/admin" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-footer-admin">
                  Admin Panel
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase mb-4" data-testid="text-customer-service">
              Customer Service
            </h4>
            <ul className="space-y-3 font-light">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-shipping">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-returns">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-faq">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-support">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 font-light text-sm" data-testid="text-copyright">
              © 2024 SafeSoft Boutique. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm font-light" data-testid="link-privacy">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors text-sm font-light" data-testid="link-terms">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const Footer = () => {
  const { t } = useLanguage();
  const { content } = useSiteContent('footer', 'general', DEFAULT_CONTENT.footer.general);

  return (
    <footer className="bg-gray-950 text-gray-300 pt-20 pb-8 border-t border-gray-800/50 text-sm">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/30">
                <span className="text-white font-heading font-bold text-xl">GT</span>
              </div>
              <h2 className="text-2xl font-heading font-bold text-white">GeorgianTrip</h2>
            </div>
            <p className="leading-relaxed text-gray-400">
              {content.brandDescription || "The most reliable way to travel across Georgia. We connect travelers with verified local drivers for safe, comfortable, and affordable private transfers."}
            </p>
            <div className="flex gap-3">
              <a href={content.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-800/80 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-300 hover:-translate-y-0.5">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={content.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-800/80 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-300 hover:-translate-y-0.5">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={content.twitterUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-800/80 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all duration-300 hover:-translate-y-0.5">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Company</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="hover:text-green-400 transition-colors flex items-center gap-2">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-green-400 transition-colors flex items-center gap-2">Contact Us</Link></li>
              <li><Link to="/driver/login" className="hover:text-green-400 transition-colors flex items-center gap-2">For Drivers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
             <h3 className="text-white font-bold mb-6 text-lg">Support</h3>
            <ul className="space-y-4">
              <li><Link to="/contact" className="hover:text-green-400 transition-colors">Help & Support</Link></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
            </ul>
            
            {/* Admin Link Section */}
            <div className="mt-6 pt-6 border-t border-gray-800/50">
              <Link to="/admin-login" className="flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors text-xs font-medium">
                <Shield className="w-3 h-3" />
                Admin Panel Access
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
             <h3 className="text-white font-bold mb-6 text-lg">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>{content.phone || "+995 32 2 000 000"}<br/><span className="text-xs text-gray-500">{content.phoneNote || "Mon-Sun 9am-9pm"}</span></span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>{content.email || "info@georgiantrip.com"}<br/><span className="text-xs text-gray-500">{content.emailNote || "Online support 24/7"}</span></span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>{content.address || "Rustaveli Ave 12, Tbilisi, Georgia"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} GeorgianTrip. All rights reserved.
          </p>
          <a
            href="https://smarketer.ge"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img
              src="https://i.postimg.cc/XYVFF6s6/smarketer-white.png"
              alt="Smarketer"
              className="h-6 w-auto"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

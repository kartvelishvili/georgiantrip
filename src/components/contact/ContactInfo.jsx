import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const ContactInfo = () => {
  const { content } = useSiteContent('contact', 'info', DEFAULT_CONTENT.contact.info);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Need help planning your trip or have questions about our services? Our team is here to assist you 24/7.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-green-100 group">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Our Office</h3>
            <p className="text-gray-600">{content.address || "123 Rustaveli Avenue, Tbilisi 0108, Georgia"}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100 group">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Phone Number</h3>
            <p className="text-gray-600">{content.phone || "+995 555 123 456"}</p>
            <p className="text-xs text-gray-400 mt-1">{content.phoneNote || "Available on WhatsApp & Telegram"}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-purple-100 group">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Email Address</h3>
            <p className="text-gray-600">{content.email || "info@georgiantrip.com"}</p>
            <p className="text-gray-600">{content.supportEmail || "support@georgiantrip.com"}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-yellow-100 group">
          <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center shrink-0 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition-colors duration-300">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Working Hours</h3>
            <p className="text-gray-600">{content.supportHours || "Customer Support: 24/7"}</p>
            <p className="text-gray-600">{content.officeHours || "Office: Mon-Fri, 10:00 - 19:00"}</p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Follow Us</h3>
        <div className="flex gap-3">
          <a href="#" className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-all duration-300 hover:-translate-y-0.5">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center text-white hover:bg-pink-700 transition-all duration-300 hover:-translate-y-0.5">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center text-white hover:bg-blue-900 transition-all duration-300 hover:-translate-y-0.5">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;